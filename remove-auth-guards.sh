#!/bin/bash

# Script to remove authentication guards and decorators from all controllers
find src -type f -name "*.controller.ts" -exec sed -i '' 's/@UseGuards(JwtAuthGuard)//g' {} \;
find src -type f -name "*.controller.ts" -exec sed -i '' 's/@ApiBearerAuth()//g' {} \;
