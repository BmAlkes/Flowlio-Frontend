# ReusableTable Pagination Audit

This document lists all usages of `ReusableTable` and their pagination status.

## ✅ Tables WITH Server-Side Pagination

### 1. Newsletter Subscribers Table

- **File**: `src/components/super admin section/newsletter/newslettersubscriberstable.tsx`
- **Hook**: `useFetchNewsletterSubscribers(page, limit)`
- **Status**: ✅ **PAGINATION IMPLEMENTED**
- **Pagination Data**: `pagination.page`, `pagination.limit`, `pagination.totalPages`, `pagination.total`

### 2. Support Tickets Table

- **File**: `src/components/super admin section/support tickets/supportticketstable.tsx`
- **Hook**: `useUniversalSupportTickets({ page, limit })`
- **Status**: ✅ **PAGINATION IMPLEMENTED**
- **Pagination Data**: `pagination.page`, `pagination.limit`, `pagination.totalPages`, `pagination.total`

## 📋 Tables WITHOUT Server-Side Pagination (Client-Side Only)

### 3. Subscriptions Table

- **File**: `src/components/super admin section/subscriptions/subscribtiontabele.tsx`
- **Hook**: `useFetchAllOrganizations()` - fetches all data
- **Status**: ⚠️ **NO SERVER-SIDE PAGINATION** (uses client-side pagination)
- **Note**: Fetches all organizations and filters client-side

### 4. Companies Table

- **File**: `src/components/super admin section/companies/companiestable.tsx`
- **Hook**: `useFetchAllOrganizations()` - fetches all data
- **Status**: ⚠️ **NO SERVER-SIDE PAGINATION** (uses client-side pagination)
- **Note**: Fetches all organizations at once

### 5. Sub Admin Table

- **File**: `src/components/super admin section/sub admin/subadmintable.tsx`
- **Hook**: `useFetchSubAdmins()` - uses infinite query
- **Status**: ⚠️ **USES INFINITE SCROLL** (Load More button)
- **Note**: Uses `useInfiniteQuery` with "Load More" pattern, not pagination

### 6. Projects Table

- **File**: `src/components/projects/projecttable.tsx`
- **Hook**: `useFetchProjects()` - fetches all data
- **Status**: ⚠️ **NO SERVER-SIDE PAGINATION** (uses client-side pagination)
- **Note**: Fetches all projects at once

### 7. Client Management Table

- **File**: `src/components/client management/clientmanagementtable.tsx`
- **Hook**: `useFetchOrganizationClients()` - fetches all data
- **Status**: ⚠️ **NO SERVER-SIDE PAGINATION** (uses client-side pagination)
- **Note**: Fetches all clients at once

### 8. Invoices Table

- **File**: `src/components/invoices/invoicetable.tsx`
- **Hook**: `useFetchInvoices()` - fetches all data
- **Status**: ⚠️ **NO SERVER-SIDE PAGINATION** (uses client-side pagination)
- **Note**: Fetches all invoices at once

### 9. Payment Links Table

- **File**: `src/components/payment link/paymentlinkstable.tsx`
- **Hook**: `useFetchPaymentLinks()` - fetches all data
- **Status**: ⚠️ **NO SERVER-SIDE PAGINATION** (uses client-side pagination)
- **Note**: Fetches all payment links at once

### 10. Support Header Table

- **File**: `src/components/support/supportheader.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

### 11. Viewer Bar Chart Table

- **File**: `src/components/viewer section/viewer barchart/viewertable.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

### 12. My Task Table

- **File**: `src/components/viewer section/my task/mytasktable.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

### 13. Time Tracking Page

- **File**: `src/pages/timetracking.page.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

### 14. My Projects Table

- **File**: `src/components/viewer section/my projects/myprojectstable.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

### 15. Company View Table

- **File**: `src/components/super admin section/companies/viewtable.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

### 16. Super Admin Bar Chart Table

- **File**: `src/components/super admin section/super admin barchart/superadmintable.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

### 17. User Management Table

- **File**: `src/components/usermanagement/usermanagementtable.tsx`
- **Hook**: Unknown (needs verification)
- **Status**: ⚠️ **NEEDS VERIFICATION**

## Summary

- **Total ReusableTable Usages**: 17
- **With Server-Side Pagination**: 2 ✅
- **Without Server-Side Pagination**: 15 ⚠️
- **Using Infinite Scroll**: 1 (Sub Admins)

## Notes

1. **Client-Side Pagination**: ReusableTable automatically handles client-side pagination when no `pagination` prop is provided. This is fine for small to medium datasets.

2. **Server-Side Pagination**: Only add pagination prop when:

   - The API/hook supports pagination (page, limit, totalPages, total)
   - The dataset is large and needs server-side pagination
   - The backend returns pagination metadata

3. **Infinite Scroll**: Sub Admins table uses a different pattern (infinite query with "Load More") which is appropriate for that use case.

## Recommendations

- ✅ Newsletter and Support Tickets already have pagination implemented
- ⚠️ Other tables use client-side pagination which is fine for current data sizes
- 🔄 If any table grows large, consider adding server-side pagination to its hook and then adding the pagination prop to ReusableTable
