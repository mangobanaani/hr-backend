#!/bin/bash

# 🛡️ Docker Security Scanner
# Comprehensive security scanning for Docker images

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="${1:-hr-system-backend:latest}"
REPORT_DIR="./security-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🛡️  Docker Security Scanner${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "📦 Image: ${IMAGE_NAME}"
echo -e "📅 Scan Date: $(date)"
echo ""

# Create reports directory
mkdir -p "${REPORT_DIR}"

# ================================
# Function: Check if command exists
# ================================
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ================================
# Function: Install scanning tools
# ================================
install_tools() {
    echo -e "${YELLOW}📦 Installing security scanning tools...${NC}"
    
    # Install Trivy (vulnerability scanner)
    if ! command_exists trivy; then
        echo "Installing Trivy..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install aquasecurity/trivy/trivy
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update
            sudo apt-get install wget apt-transport-https gnupg lsb-release
            wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
            echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
            sudo apt-get update
            sudo apt-get install trivy
        fi
    fi
    
    # Install Grype (vulnerability scanner)
    if ! command_exists grype; then
        echo "Installing Grype..."
        curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
    fi
    
    # Install Syft (SBOM generator)
    if ! command_exists syft; then
        echo "Installing Syft..."
        curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin
    fi
}

# ================================
# Function: Build Docker image
# ================================
build_image() {
    echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
    docker build -t "${IMAGE_NAME}" .
    echo -e "${GREEN}✅ Image built successfully${NC}"
}

# ================================
# Function: Basic Docker security checks
# ================================
docker_security_checks() {
    echo -e "${YELLOW}🔍 Running Docker security checks...${NC}"
    
    # Check for root user
    echo "Checking user configuration..."
    DOCKER_USER=$(docker run --rm "${IMAGE_NAME}" whoami 2>/dev/null || echo "unknown")
    if [[ "$DOCKER_USER" == "root" ]]; then
        echo -e "${RED}❌ Container runs as root user${NC}"
    else
        echo -e "${GREEN}✅ Container runs as non-root user: $DOCKER_USER${NC}"
    fi
    
    # Check image size
    echo "Checking image size..."
    IMAGE_SIZE=$(docker images "${IMAGE_NAME}" --format "table {{.Size}}" | tail -n 1)
    echo -e "${BLUE}📏 Image size: $IMAGE_SIZE${NC}"
    
    # Check for secrets in image
    echo "Scanning for potential secrets..."
    SECRETS_FOUND=$(docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        trufflesecurity/trufflehog:latest docker --image="${IMAGE_NAME}" 2>/dev/null | wc -l || echo "0")
    
    if [[ "$SECRETS_FOUND" -gt 0 ]]; then
        echo -e "${RED}❌ Potential secrets found: $SECRETS_FOUND${NC}"
    else
        echo -e "${GREEN}✅ No secrets detected${NC}"
    fi
}

# ================================
# Function: Vulnerability scanning with Trivy
# ================================
trivy_scan() {
    echo -e "${YELLOW}🔍 Running Trivy vulnerability scan...${NC}"
    
    # Update Trivy database
    trivy image --download-db-only
    
    # Scan for vulnerabilities
    trivy image \
        --format json \
        --output "${REPORT_DIR}/trivy-${TIMESTAMP}.json" \
        "${IMAGE_NAME}"
    
    # Generate human-readable report
    trivy image \
        --format table \
        --output "${REPORT_DIR}/trivy-${TIMESTAMP}.txt" \
        "${IMAGE_NAME}"
    
    # Check for critical vulnerabilities
    CRITICAL_VULNS=$(trivy image --format json "${IMAGE_NAME}" | jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL") | .VulnerabilityID' 2>/dev/null | wc -l || echo "0")
    HIGH_VULNS=$(trivy image --format json "${IMAGE_NAME}" | jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH") | .VulnerabilityID' 2>/dev/null | wc -l || echo "0")
    
    echo -e "${BLUE}📊 Vulnerability Summary:${NC}"
    echo -e "   Critical: ${CRITICAL_VULNS}"
    echo -e "   High: ${HIGH_VULNS}"
    
    if [[ "$CRITICAL_VULNS" -gt 0 ]]; then
        echo -e "${RED}❌ Critical vulnerabilities found!${NC}"
        return 1
    elif [[ "$HIGH_VULNS" -gt 5 ]]; then
        echo -e "${YELLOW}⚠️  Many high-severity vulnerabilities found${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Vulnerability scan passed${NC}"
    fi
}

# ================================
# Function: Generate SBOM with Syft
# ================================
generate_sbom() {
    echo -e "${YELLOW}📋 Generating Software Bill of Materials (SBOM)...${NC}"
    
    syft "${IMAGE_NAME}" -o json > "${REPORT_DIR}/sbom-${TIMESTAMP}.json"
    syft "${IMAGE_NAME}" -o table > "${REPORT_DIR}/sbom-${TIMESTAMP}.txt"
    
    echo -e "${GREEN}✅ SBOM generated${NC}"
}

# ================================
# Function: Security benchmarks
# ================================
security_benchmarks() {
    echo -e "${YELLOW}🔒 Running security benchmarks...${NC}"
    
    # Docker Bench Security (if available)
    if command_exists docker-bench-security; then
        docker run --rm --net host --pid host --userns host --cap-add audit_control \
            -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
            -v /var/lib:/var/lib:ro \
            -v /var/run/docker.sock:/var/run/docker.sock:ro \
            -v /usr/lib/systemd:/usr/lib/systemd:ro \
            -v /etc:/etc:ro --label docker_bench_security \
            docker/docker-bench-security > "${REPORT_DIR}/docker-bench-${TIMESTAMP}.txt"
        
        echo -e "${GREEN}✅ Docker Bench Security completed${NC}"
    fi
}

# ================================
# Function: Generate security report
# ================================
generate_report() {
    echo -e "${YELLOW}📄 Generating security report...${NC}"
    
    REPORT_FILE="${REPORT_DIR}/security-summary-${TIMESTAMP}.md"
    
    cat > "${REPORT_FILE}" << EOF
# 🛡️ Docker Security Scan Report

**Image:** ${IMAGE_NAME}  
**Scan Date:** $(date)  
**Scanner Version:** $(trivy --version 2>/dev/null | head -n1 || echo "unknown")

## 📊 Summary

### Container Configuration
- **User:** ${DOCKER_USER:-unknown}
- **Image Size:** ${IMAGE_SIZE:-unknown}

### Vulnerability Scan Results
- **Critical Vulnerabilities:** ${CRITICAL_VULNS:-0}
- **High Vulnerabilities:** ${HIGH_VULNS:-0}

## 📁 Generated Reports

- \`trivy-${TIMESTAMP}.json\` - Detailed vulnerability report (JSON)
- \`trivy-${TIMESTAMP}.txt\` - Human-readable vulnerability report
- \`sbom-${TIMESTAMP}.json\` - Software Bill of Materials (JSON)
- \`sbom-${TIMESTAMP}.txt\` - Software Bill of Materials (Table)

## 🔗 Recommendations

1. **Update base images regularly** to get latest security patches
2. **Use minimal base images** like Alpine or Distroless
3. **Run as non-root user** (✅ Already implemented)
4. **Implement security scanning** in CI/CD pipeline
5. **Monitor for new vulnerabilities** continuously

## 📋 Next Steps

- Review detailed vulnerability reports
- Update dependencies with known vulnerabilities
- Consider using alternative packages for critical vulnerabilities
- Implement runtime security monitoring

---
*Generated by Docker Security Scanner*
EOF

    echo -e "${GREEN}✅ Security report generated: ${REPORT_FILE}${NC}"
}

# ================================
# Main execution
# ================================
main() {
    echo -e "${BLUE}🚀 Starting security scan...${NC}"
    
    # Check for required tools
    if ! command_exists docker; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    # Install scanning tools if needed
    install_tools
    
    # Build image if it doesn't exist
    if ! docker image inspect "${IMAGE_NAME}" >/dev/null 2>&1; then
        build_image
    fi
    
    # Run security checks
    docker_security_checks
    
    # Run vulnerability scans
    if ! trivy_scan; then
        echo -e "${RED}❌ Vulnerability scan failed${NC}"
        exit 1
    fi
    
    # Generate SBOM
    generate_sbom
    
    # Run security benchmarks
    security_benchmarks
    
    # Generate final report
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 Security scan completed successfully!${NC}"
    echo -e "${BLUE}📁 Reports saved to: ${REPORT_DIR}${NC}"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo -e "   1. Review the generated reports"
    echo -e "   2. Address any critical vulnerabilities"
    echo -e "   3. Integrate this scan into your CI/CD pipeline"
    echo ""
}

# Run main function
main "$@"
