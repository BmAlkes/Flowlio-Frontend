# Translation Guide - Flowlio

## How to Use Translations in Your Components

### Step 1: Import useTranslation Hook

```tsx
import { useTranslation } from "react-i18next";
```

### Step 2: Use the Hook in Your Component

```tsx
const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <button>{t("common.save")}</button>
    </div>
  );
};
```

### Step 3: Add Translation Keys to JSON Files

Add your translations to all 4 language files:

- `src/locales/en.json` (English)
- `src/locales/es.json` (Spanish)
- `src/locales/pt.json` (Portuguese)
- `src/locales/he.json` (Hebrew)

### Example Translation Structure

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome"
  }
}
```

### Common Translation Keys Available

- `common.save` - "Save"
- `common.cancel` - "Cancel"
- `common.delete` - "Delete"
- `common.edit` - "Edit"
- `common.create` - "Create"
- `common.loading` - "Loading..."
- `common.saving` - "Saving..."
- `settings.title` - "Settings"
- `settings.saveChanges` - "Save Changes"
- `dashboard.title` - "Dashboard"
- `dashboard.totalClients` - "Total Clients"
- `dashboard.activeProjects` - "Active Projects"

### Quick Reference

**Before:**

```tsx
<h1>Settings</h1>
<button>Save Changes</button>
```

**After:**

```tsx
const { t } = useTranslation();
<h1>{t("settings.title")}</h1>
<button>{t("settings.saveChanges")}</button>
```

### Language Switcher

Users can change language from:

1. **Navbar** - Compact language switcher (top right)
2. **Settings Page** - Full language switcher with description

Language preference is saved in localStorage and persists across sessions.
