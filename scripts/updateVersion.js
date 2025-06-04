const fs = require('fs');
const path = require('path');
const semver = require('semver');

// Read the package.json file
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Parse command line arguments
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // major, minor, patch
const featureId = args[1];
const featureCategory = args[2] || 'platformFeatures';

// Increment version
const currentVersion = packageJson.version;
const newVersion = semver.inc(currentVersion, versionType);

console.log(`Updating version from ${currentVersion} to ${newVersion}`);

// Update version in package.json
packageJson.version = newVersion;

// If a feature ID is provided, update its status
if (featureId && packageJson.features) {
  let featureFound = false;
  
  // Check in coming soon features
  if (packageJson.features.comingSoon) {
    const featureIndex = packageJson.features.comingSoon.findIndex(f => f.id === featureId);
    
    if (featureIndex !== -1) {
      const feature = packageJson.features.comingSoon[featureIndex];
      
      // Remove from coming soon
      packageJson.features.comingSoon.splice(featureIndex, 1);
      
      // Add to appropriate category
      if (!packageJson.features[featureCategory]) {
        packageJson.features[featureCategory] = [];
      }
      
      // Add to category as available feature
      packageJson.features[featureCategory].push({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        icon: feature.icon || 'default',
        isAvailable: true,
        versionAdded: newVersion
      });
      
      console.log(`Moved feature ${featureId} from comingSoon to ${featureCategory}`);
      featureFound = true;
    }
  }
  
  if (!featureFound) {
    console.log(`Feature ${featureId} not found in comingSoon. If you want to add a new feature, please edit package.json manually.`);
  }
}

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('package.json updated successfully');