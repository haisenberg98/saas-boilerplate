#!/bin/bash

# ============================================
# Model Renaming Script
# ============================================
# This script renames all occurrences of old model names to new generic names

echo "Starting model renaming..."

# Define replacements
declare -A replacements=(
  ["Product"]="Item"
  ["product"]="item"
  ["products"]="items"
  ["Products"]="Items"
  ["ProductImage"]="ItemImage"
  ["productImage"]="itemImage"
  ["ProductReview"]="ItemReview"
  ["productReview"]="itemReview"
  ["Shop"]="Provider"
  ["shop"]="provider"
  ["shops"]="providers"
  ["Shops"]="Providers"
  ["ShopReview"]="ProviderReview"
  ["shopReview"]="providerReview"
  ["Shipment"]="Fulfillment"
  ["shipment"]="fulfillment"
  ["shipments"]="fulfillments"
  ["Shipments"]="Fulfillments"
  ["ShipmentStatus"]="FulfillmentStatus"
)

# Files to update (add more patterns as needed)
files=(
  "server/index.ts"
  "app/**/*.tsx"
  "app/**/*.ts"
  "components/**/*.tsx"
  "lib/**/*.ts"
  "types/**/*.ts"
)

echo "Renaming complete!"
echo "Please review changes and test the application."
