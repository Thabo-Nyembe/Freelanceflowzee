#!/usr/bin/env node

/**
 * Test ID Verification Script for FreeflowZee Dashboard
 * Verifies all components have proper test IDs for automated testing
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 FreeflowZee Test ID Verification');
console.log('===================================');

class TestIDVerifier {
  constructor() {
    this.dashboardComponents = [
      {
        name: 'Projects Hub',
        path: 'app/(app)/dashboard/projects-hub/page.tsx',
        expectedTestIds: ['create-project-btn', 'import-project-btn', 'quick-start-btn', 'view-all-btn', 'export-data-btn'
        ]
      },
      {
        name: 'Video Studio',
        path: 'app/(app)/dashboard/video-studio/page.tsx',
        expectedTestIds: ['record-btn', 'edit-btn', 'upload-btn', 'share-btn', 'export-btn'
        ]
      },
      {
        name: 'Community Hub',
        path: 'components/community/enhanced-community-hub.tsx',
        expectedTestIds: ['like-btn', 'share-btn', 'comment-btn', 'follow-creator-btn'
        ]
      },
      {
        name: 'AI Assistant',
        path: 'app/(app)/dashboard/ai-assistant/page.tsx',
        expectedTestIds: ['send-message-btn', 'take-action-btn', 'quick-action-btn', 'clear-chat-btn'
        ]
      },
      {
        name: 'My Day Today',
        path: 'app/(app)/dashboard/my-day/page.tsx',
        expectedTestIds: ['add-task-btn', 'view-calendar-btn', 'generate-schedule-btn', 'start-timer-btn'
        ]
      },
      {
        name: 'Files Hub',
        path: 'components/hubs/files-hub.tsx',
        expectedTestIds: ['upload-file-btn', 'new-folder-btn', 'share-file-btn', 'download-file-btn', 'delete-file-btn'
        ]
      },
      {
        name: 'Escrow System',
        path: 'app/(app)/dashboard/escrow/page.tsx',
        expectedTestIds: ['request-deposit-btn', 'release-funds-btn', 'download-receipt-btn', 'view-details-btn'
        ]
      },
      {
        name: 'AI Create',
        path: 'components/collaboration/ai-create.tsx',
        expectedTestIds: ['generate-assets-btn', 'preview-asset-btn', 'download-asset-btn', 'upload-asset-btn',
          'export-all-btn']
      }
    ];
  }

  verifyComponent(component) {
    console.log(`\\n🔍 Verifying: ${component.name}`);
    console.log(`📁 Path: ${component.path}`);

    try {
      const filePath = path.join(process.cwd(), component.path);
      const content = fs.readFileSync(filePath, 'utf8');

      const results = {
        found: [],
        missing: [],
        total: component.expectedTestIds.length
      };

      component.expectedTestIds.forEach(testId => {
        if (content.includes(`data-testid= "${testId}"`)) {
          console.log(`   ✅ ${testId}`);
          results.found.push(testId);
        } else {
          console.log(`   ❌ ${testId}`);
          results.missing.push(testId);
        }
      });

      const percentage = Math.round((results.found.length / results.total) * 100);
      console.log(`📊 Test IDs: ${results.found.length}/${results.total} (${percentage}%)`);

      return {
        component: component.name,
        ...results,
        percentage
      };

    } catch (error) {
      console.log(`❌ Error reading file: ${error.message}`);
      return {
        component: component.name,
        found: [],
        missing: component.expectedTestIds,
        total: component.expectedTestIds.length,
        percentage: 0,
        error: error.message
      };
    }
  }

  async run() {
    console.log('🚀 Starting test ID verification...');
    
    const results = [];
    let totalTestIds = 0;
    let totalFound = 0;

    for (const component of this.dashboardComponents) {
      const result = this.verifyComponent(component);
      results.push(result);
      totalTestIds += result.total;
      totalFound += result.found.length;
    }

    // Generate summary
    console.log('\\n📊 VERIFICATION SUMMARY');
    console.log('=======================');
    
    results.forEach(result => {
      const status = result.percentage === 100 ? '✅' : '
                    result.percentage >= 80 ? '⚠️' : '❌';'
      console.log(`${status} ${result.component.padEnd(20)} | ${result.found.length}/${result.total} (${result.percentage}%)`);
    });

    const overallPercentage = Math.round((totalFound / totalTestIds) * 100);
    console.log(`\\n🎯 OVERALL RESULTS`);
    console.log(`================`);
    console.log(`✅ Total Test IDs Found: ${totalFound}/${totalTestIds}`);
    console.log(`📊 Overall Success Rate: ${overallPercentage}%`);

    if (overallPercentage === 100) {
      console.log(`🏆 PERFECT! All test IDs implemented correctly`);
      console.log(`🚀 Ready for automated testing and production deployment`);
    } else if (overallPercentage >= 90) {
      console.log(`🎯 EXCELLENT! Almost all test IDs implemented`);
      console.log(`🔧 Minor fixes needed for 100% completion`);
    } else if (overallPercentage >= 80) {
      console.log(`⚠️  GOOD! Most test IDs implemented`);
      console.log(`🔧 Some components need test ID updates`);
    } else {
      console.log(`❌ NEEDS WORK! Many test IDs missing`);
      console.log(`🔧 Significant test ID implementation required`);
    }

    // Show missing test IDs
    const allMissing = results.filter(r => r.missing.length > 0);
    if (allMissing.length > 0) {
      console.log(`\\n🔧 MISSING TEST IDs BY COMPONENT:`);
      allMissing.forEach(result => {
        console.log(`\\n❌ ${result.component}:`);
        result.missing.forEach(testId => {
          console.log(`   - ${testId}`);
        });
      });
    }

    console.log(`\\n🎯 VERIFICATION COMPLETE!`);
    console.log(`📊 Success Rate: ${overallPercentage}%`);
    
    return {
      totalFound,
      totalTestIds,
      overallPercentage,
      results
    };
  }
}

// Run the verification
const verifier = new TestIDVerifier();
verifier.run().catch(console.error); 