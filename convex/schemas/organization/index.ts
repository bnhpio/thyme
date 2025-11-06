import organizationTable from "./organization";
import organizationMemberTable from "./organizationMember";
import organizationInviteTable from "./organizationInvite";


export const organizationSchema = {
   organizations: organizationTable,
	organizationMembers: organizationMemberTable,
	organizationInvites: organizationInviteTable,

}