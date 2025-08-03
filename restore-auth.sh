#!/bin/bash

# Controllers to restore authentication (excluding auth controller)
controllers=(
  "departments"
  "benefits" 
  "performance"
  "training"
  "time-tracking"
  "expenses"
  "projects"
  "companies"
  "documents"
  "policies"
  "announcements"
)

for controller in "${controllers[@]}"; do
  echo "Restoring authentication to $controller controller..."
  
  # Find the controller file
  file="src/$controller/$controller.controller.ts"
  
  if [ -f "$file" ]; then
    # Use sed to restore the auth decorators
    sed -i '' 's/@ApiTags.*/@ApiTags('\'''"$controller"'\''\')\
@ApiBearerAuth()\
@UseGuards(JwtAuthGuard)/' "$file"
    echo "✓ Updated $file"
  else
    echo "✗ File not found: $file"
  fi
done

echo "Authentication restoration complete!"
