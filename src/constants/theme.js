// src/constants/theme.js
const Theme = {
  Colors: {
    primary: '#1D61E7',
    secondary: '#333',
    danger: '#FF3D00',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#888888',
  },
  Fonts: {
    regular: 'Poppins-Regular',
    bold: 'Poppins-Bold',
    extraBold: 'Poppins-ExtraBold',
  },
  FontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
};

export default Theme;


// – childCompanyId (int): Identifier for the child company.
// – branchId (int): Identifier for the branch.
// – designationId (int): Identifier for the designation.
// – userType (int): User type classification.
// – employeeId (int): Identifier for the employee.
// – departmentId (int): Identifier for the department.
// – fromDate (datetime): Start date of the report range.
// – toDate (datetime): End date of the report range.


//     public class CommonParameter
//     {
//         public int EmployeeId { get; set; } = 0;
//         public int Month { get; set; } = 0;
//         public int Year { get; set; } = 0;
//         public int ChildCompanyId { get; set; } = 0;
//         public DateTime FromDate { get; set; }
//         public DateTime ToDate { get; set; }
//         public int BranchId { get; set; } = 0;
//         public int EmployeeTypeId { get; set; } = 0;
//         public int DId { get; set; }
//         public string? DraftName { get; set; }
//         public int UserId { get; set; } = 0;
//         public string? status { get; set; }
//         public int[]? Ids { get; set; }
//         public string? CoverLatter { get; set; }
//         public int DepartmentId { get; set; } = 0;
//         public int DesignationId { get; set; } = 0;
//         public int userType { get; set; }
//         //assign the HrDesignationId -Anshuman(04-05-2024)
//         //public int HrDesignationId { get; set; }
//         public int CalculationType { get; set; }
//         //required for childcompany List display in case super admin login --Anshuman 23.05.2024
//         public List<TblChildCompany>? childCompanies { get; set; }
//         //for taking multiple employee ids for pay roll generation -Anshuman 07.02.2025
//         //for taking multiple employee ids for pay roll generation -Anshuman 07.02.2025
//         public List<int>? branchIds { get; set; }
//         public List<int>? departmentsIds { get; set; }
//         public List<int>? designationIds { get; set; }
//         public List<int>? employeeTypeIds { get; set; }
//         public List<int>? employeeIds { get; set; }
//         public bool hasAllReportAccess { get; set; }
//     }
// }
