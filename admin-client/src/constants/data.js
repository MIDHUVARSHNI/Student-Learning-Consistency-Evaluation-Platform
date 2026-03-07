export const DEPARTMENTS = [
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'ECE', name: 'Electronics & Communication Engineering' },
    { code: 'MECH', name: 'Mechanical Engineering' },
    { code: 'CIVIL', name: 'Civil Engineering' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'AIDS', name: 'AI & Data Science' },
    { code: 'BT', name: 'Biotechnology' },
    { code: 'CHEM', name: 'Chemical Engineering' },
    { code: 'MBA', name: 'Business Administration' },
];

export const YEARS = [
    { id: 'be1', label: '1st Year B.E.', short: 'B.E. I', color: '#1565c0', bg: '#e3f2fd' },
    { id: 'be2', label: '2nd Year B.E.', short: 'B.E. II', color: '#6a1b9a', bg: '#f3e5f5' },
    { id: 'be3', label: '3rd Year B.E.', short: 'B.E. III', color: '#2e7d32', bg: '#e8f5e9' },
    { id: 'be4', label: '4th Year B.E.', short: 'B.E. IV', color: '#e65100', bg: '#fff3e0' },
    { id: 'msc1', label: '1st Year M.Sc.', short: 'M.Sc. I', color: '#00695c', bg: '#e0f2f1' },
    { id: 'msc2', label: '2nd Year M.Sc.', short: 'M.Sc. II', color: '#ad1457', bg: '#fce4ec' },
    { id: 'mba1', label: '1st Year MBA', short: 'MBA I', color: '#4527a0', bg: '#ede7f6' },
    { id: 'mba2', label: '2nd Year MBA', short: 'MBA II', color: '#558b2f', bg: '#f1f8e9' },
    { id: 'mtech1', label: '1st Year M.Tech', short: 'M.Tech I', color: '#00838f', bg: '#e0f7fa' },
    { id: 'mtech2', label: '2nd Year M.Tech', short: 'M.Tech II', color: '#c62828', bg: '#ffebee' },
];

export const SUBJECT_MAP = {
    'CSE': [
        'Data Structures & Algorithms', 'Object-Oriented Programming', 'Operating Systems',
        'Database Management Systems', 'Computer Networks', 'Software Engineering',
        'Compiler Design',
    ],
    'ECE': [
        'Digital Electronics', 'Signals & Systems', 'VLSI Design',
        'Embedded Systems', 'Microprocessors', 'Wireless Communication',
        'Antenna & Wave Propagation',
    ],
    'MECH': [
        'Thermodynamics', 'Fluid Mechanics', 'Manufacturing Technology',
        'Theory of Machines', 'Heat Transfer', 'Engineering Materials',
        'CAD/CAM',
    ],
    'CIVIL': [
        'Structural Analysis', 'Surveying', 'Concrete Technology',
        'Soil Mechanics', 'Hydraulics', 'Construction Management',
        'Environmental Engineering',
    ],
    'EEE': [
        'Power Systems', 'Control Systems', 'Power Electronics',
        'Electrical Machines', 'Circuit Theory', 'High Voltage Engineering',
        'Renewable Energy Systems',
    ],
    'IT': [
        'Cloud Computing', 'Network Security', 'Mobile Application Development',
        'Web Technologies', 'Data Warehousing', 'IoT & Smart Systems',
        'DevOps & CI/CD',
    ],
    'AIDS': [
        'Machine Learning', 'Deep Learning', 'Natural Language Processing',
        'Computer Vision', 'Big Data Analytics', 'Reinforcement Learning',
        'AI Ethics & Governance',
    ],
    'BT': [
        'Molecular Biology', 'Genetic Engineering', 'Bioinformatics',
        'Biochemistry', 'Microbiology', 'Bioprocess Engineering',
        'Immunology',
    ],
    'CHEM': [
        'Process Engineering', 'Mass Transfer', 'Reaction Engineering',
        'Chemical Thermodynamics', 'Instrumentation', 'Polymer Technology',
        'Petrochemical Technology',
    ],
    'MBA': [
        'Financial Management', 'Marketing Management', 'Human Resource Management',
        'Operations Research', 'Business Analytics', 'Strategic Management',
        'Entrepreneurship',
    ],
};
