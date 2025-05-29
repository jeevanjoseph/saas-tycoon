function generateFeatureName() {
    const domains = [
        'ERP', 'HCM', 'CRM', 'SCM', 'PLM', 'EPM', 'SRM', 'BI', 'HRIS', 'ATS', 'LMS', 'WMS', 'MES'
    ];
    const features = [
        'Dashboard', 'Analytics', 'Integration', 'Reporting', 'Mobile App', 'Workflow', 'Automation',
        'Self-Service', 'API', 'Data Sync', 'Notifications', 'User Management', 'Role-Based Access',
        'Custom Fields', 'Audit Trail', 'Document Management', 'Forecasting', 'Collaboration', 'Chatbot',
        'Scheduling', 'Time Tracking', 'Expense Management', 'Approval Process', 'KPI Tracking'
    ];

    const domain = domains[Math.floor(Math.random() * domains.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    return `${domain} ${feature}`;
}

module.exports = generateFeatureName;