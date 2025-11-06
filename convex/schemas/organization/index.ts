import organizationTable from './organization';
import organizationInviteTable from './organizationInvite';
import organizationMemberTable from './organizationMember';

export const organizationSchema = {
  organizations: organizationTable,
  organizationMembers: organizationMemberTable,
  organizationInvites: organizationInviteTable,
};
