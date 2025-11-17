export interface FSResourceModel {
  id?: number;
  linkedUserFullName?: string;
  branch?: FSBranchModel;
  linkedUserId?: number;
  commonResource?: boolean;
  active?: boolean;
}

export interface FSBranchModel {
  id?: number;
  name?: string;
}
