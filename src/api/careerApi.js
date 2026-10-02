import { createResource } from './resource';
import { API } from '../constants/endpoints';
import listMine from './mine';

export const applications = createResource(API.jobApplications);
/** Sirf logged-in user ki job applications. */
export function myApplications(user, params = {}) {
  return listMine(applications, user, {
    params: { ordering: '-created_at', ...params },
    userParam: 'user',
    phoneParam: 'phone',
  });
}
export default { applications, myApplications };

// Fixed position list mirrors JobApplication.POSITION_CHOICES on the backend.
export const POSITIONS = [
  ['national_coordinator', 'National Coordinator'],
  ['state_coordinator', 'State Co-ordinator'],
  ['district_coordinator', 'District Coordinator'],
  ['area_manager', 'Area Manager'],
  ['asst_district_coordinator', 'Assistant District Coordinator'],
  ['marriage_verification_officer', 'Marriage Verification Officer'],
  ['surveyor', 'Surveyor'],
  ['legal_advisor', 'Legal Advisor'],
  ['reporting_director', 'Reporting Director'],
  ['project_manager', 'Project Manager'],
  ['media_press_reporter', 'Media / Press Reporter'],
  ['software_developer', 'Software Developer'],
  ['web_developer_designer', 'Web Developer & Designer'],
  ['accountant', 'Accountant'],
  ['it_manager', 'IT Manager'],
  ['computer_operator', 'Computer Operator'],
  ['data_entry_operator', 'Data Entry Operator'],
  ['counselor', 'Counselor'],
  ['tele_caller', 'Tele-Caller'],
  ['driver', 'Driver'],
  ['maid_cook', 'Maid & Cook'],
].map(([value, label]) => ({ value, label }));

export const EXPERIENCE = [
  { value: 'fresher', label: 'Fresher' },
  { value: '0-1', label: '0-1 Years' },
  { value: '1-3', label: '1-3 Years' },
  { value: '3-5', label: '3-5 Years' },
  { value: '5+', label: '5+ Years' },
];
