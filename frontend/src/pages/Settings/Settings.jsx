import React, { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Moon,
  RotateCcw,
  Save,
  ShieldCheck,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  Mail,
  Lock,
  Sun,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { apiGet, apiPut } from "../../services/api";
import toast from "react-hot-toast";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  attendanceReminder: true,
  lowAttendanceAlert: true,
  loginAlerts: true,
  autoSaveAttendance: true,
  allowDuplicateAttendance: false,
  minimumAttendance: 75,
  sessionTimeout: 30,
  emailReports: false,
};

// SETTING ROW
const SettingRow = ({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
  darkMode = false,
}) => (
  <div
    className={`flex w-full min-w-0 flex-col gap-4 border-b px-4 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
      darkMode ? "border-slate-700" : "border-slate-100"
    } ${disabled ? "opacity-60" : ""}`}
  >
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          darkMode
            ? "bg-slate-700 text-slate-200"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <h4
          className={`break-words text-sm font-semibold ${
            darkMode ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {title}
        </h4>
        <p
          className={`mt-1 break-words text-xs leading-5 sm:text-sm ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      </div>
    </div>

    <div className="flex w-full justify-end sm:w-auto sm:shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 disabled:cursor-not-allowed ${
          checked ? "bg-indigo-600" : "bg-slate-400"
        }`}
        aria-label={title}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  </div>
);

// SECTION CARD
const SettingSection = ({
  icon: Icon,
  title,
  description,
  children,
  open,
  onToggle,
  darkMode = false,
}) => (
  <section
    className={`w-full min-w-0 overflow-hidden rounded-2xl border shadow-sm ${
      darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`flex w-full min-w-0 items-center justify-between gap-3 px-4 py-4 text-left transition sm:px-6 sm:py-5 ${
        darkMode
          ? "hover:bg-slate-700 active:bg-slate-600"
          : "hover:bg-slate-50 active:bg-slate-100"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 sm:h-11 sm:w-11">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className={`break-words text-sm font-bold sm:text-base lg:text-lg ${
              darkMode ? "text-slate-100" : "text-slate-800"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-1 break-words text-[11px] leading-4 sm:text-sm sm:leading-5 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${
          darkMode
            ? "bg-slate-700 text-slate-200"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </span>
    </button>

    {open && (
      <div
        className={`w-full min-w-0 border-t pb-2 ${
          darkMode ? "border-slate-700" : "border-slate-100"
        }`}
      >
        {children}
      </div>
    )}
  </section>
);

// PREFERENCE CARD
const PreferenceCard = ({ title, value, darkMode }) => (
  <div
    className={`min-w-0 rounded-xl border p-4 ${
      darkMode
        ? "border-slate-700 bg-slate-900"
        : "border-slate-200 bg-slate-50"
    }`}
  >
    <p
      className={`truncate text-xs font-medium ${
        darkMode ? "text-slate-400" : "text-slate-500"
      }`}
    >
      {title}
    </p>
    <p
      className={`mt-1 break-words text-sm font-bold ${
        darkMode ? "text-slate-100" : "text-slate-800"
      }`}
    >
      {value}
    </p>
  </div>
);

// INFO ITEM
const InfoItem = ({ label, value, darkMode }) => (
  <div
    className={`min-w-0 rounded-xl border p-4 ${
      darkMode
        ? "border-slate-700 bg-slate-900"
        : "border-slate-200 bg-slate-50"
    }`}
  >
    <p
      className={darkMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}
    >
      {label}
    </p>
    <p
      className={`mt-1 break-words text-sm font-semibold ${
        darkMode ? "text-slate-100" : "text-slate-800"
      }`}
    >
      {value}
    </p>
  </div>
);

// SETTINGS PAGE
const Settings = () => {
  const { darkMode, toggleDarkMode, setDarkMode, toggleTheme } = useTheme();

  const changeTheme = (value) => {
    if (typeof toggleDarkMode === "function") {
      toggleDarkMode(value);
    } else if (typeof setDarkMode === "function") {
      setDarkMode(value);
    } else if (typeof toggleTheme === "function") {
      if (value !== darkMode) toggleTheme();
    } else {
      toast.error("ThemeContext does not provide a theme toggle.");
      return;
    }

    toast.success(value ? "Dark mode enabled." : "Light mode enabled.");
  };

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("attendanceSystemSettings");
      return saved
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [saved, setSaved] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [openSections, setOpenSections] = useState({
    appearance: true,
    notifications: true,
    attendance: true,
    security: true,
    system: true,
  });

  // Load the logged-in user's settings from the backend.
  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const resetSettings = async () => {
          if (savingSettings) return;

          setSavingSettings(true);

          try {
            const response = await apiPut("/api/settings/me", DEFAULT_SETTINGS);

            const merged = {
              ...DEFAULT_SETTINGS,
              ...(response?.settings ?? {}),
            };

            setSettings(merged);
            localStorage.setItem(
              "attendanceSystemSettings",
              JSON.stringify(merged),
            );

            setSaved(false);
            toast.success("Settings restored to defaults.");
          } catch (error) {
            toast.error(error?.message || "Failed to reset settings.");
          } finally {
            setSavingSettings(false);
          }
        };
      } catch (error) {
        if (active) {
          toast.error(
            error?.message || "Could not load settings from the server.",
          );
        }
      } finally {
        if (active) setLoadingSettings(false);
      }
    };

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSaved(false);
  };

  const updatePreferenceWithToast = (key, value) => {
    updateSetting(key, value);

    const settingNames = {
      emailNotifications: "Email Notifications",
      attendanceReminder: "Attendance Reminder",
      lowAttendanceAlert: "Low Attendance Alert",
      loginAlerts: "Login Alerts",
      emailReports: "Email Reports",
      autoSaveAttendance: "Auto Save Attendance",
      allowDuplicateAttendance: "Duplicate Attendance",
    };

    const settingName = settingNames[key] || "Setting";

    if (value) {
      toast.success(`${settingName} enabled.`);
    } else {
      toast(`${settingName} disabled.`, {
        icon: "🔕",
      });
    }
  };

  const toggleSection = (section) => {
    setOpenSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  const saveSettings = async () => {
    if (savingSettings) return;

    setSavingSettings(true);

    try {
      const response = await apiPut("/api/settings/me", settings);
      const preferences = response?.settings ?? settings;
      const merged = { ...DEFAULT_SETTINGS, ...preferences };

      setSettings(merged);
      localStorage.setItem("attendanceSystemSettings", JSON.stringify(merged));

      setSaved(true);
      toast.success(response?.message || "Settings saved successfully.");
    } catch (error) {
      toast.error(error?.message || "Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const resetSettings = async () => {
    if (savingSettings) return;

    setSavingSettings(true);

    try {
      const response = await apiPut("/api/settings/me", DEFAULT_SETTINGS);
      const preferences = response?.settings ?? DEFAULT_SETTINGS;
      const merged = { ...DEFAULT_SETTINGS, ...preferences };

      setSettings(merged);
      localStorage.setItem("attendanceSystemSettings", JSON.stringify(merged));

      setSaved(false);
      toast.success("Settings restored to defaults.");
    } catch (error) {
      toast.error(error?.message || "Failed to reset settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const surface = darkMode
    ? "border-slate-700 bg-slate-800"
    : "border-slate-200 bg-white";

  const headingText = darkMode ? "text-slate-100" : "text-slate-900";
  const bodyText = darkMode ? "text-slate-400" : "text-slate-500";

  const inputClass = `w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
    darkMode
      ? "border-slate-600 bg-slate-900 text-slate-100"
      : "border-slate-200 bg-white text-slate-700"
  }`;

  const secondaryButton = `flex min-h-[42px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 ${
    darkMode
      ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }`;

  const primaryButton =
    "flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5";

  const renderRow = (props) => <SettingRow {...props} darkMode={darkMode} />;

  const renderSection = (props) => (
    <SettingSection {...props} darkMode={darkMode} />
  );

  return (
    <div
      className={`min-h-full w-full min-w-0 overflow-x-hidden ${
        darkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <main className="mx-auto w-full max-w-[1600px] min-w-0 px-3 pb-10 pt-4 sm:px-4 sm:pb-12 sm:pt-5 md:px-6 md:pb-14 lg:px-8 lg:pb-16 xl:px-10 2xl:px-12">
        {/* HEADER */}
        <header className="mb-5 w-full min-w-0 sm:mb-6 md:mb-8">
          <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm sm:h-12 sm:w-12">
                <SettingsIcon size={22} />
              </div>
              <div className="min-w-0">
                <h1
                  className={`truncate text-xl font-bold sm:text-2xl lg:text-3xl ${headingText}`}
                >
                  Settings
                </h1>
                <p className={`mt-1 truncate text-xs sm:text-sm ${bodyText}`}>
                  Manage your attendance system preferences
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              <button
                type="button"
                disabled={savingSettings}
                onClick={resetSettings}
                className={secondaryButton}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                disabled={savingSettings}
                onClick={saveSettings}
                className={primaryButton}
              >
                <Save size={16} />
                <span>{savingSettings ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        </header>

        {loadingSettings && (
          <p className={`mb-4 text-sm ${bodyText}`}>
            Loading your saved preferences...
          </p>
        )}

        {saved && (
          <div className="mb-5 flex w-full min-w-0 items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 sm:mb-6">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span className="break-words">Settings saved successfully.</span>
          </div>
        )}

        <div className="w-full min-w-0 space-y-4 sm:space-y-5">
          {/* APPEARANCE */}
          {renderSection({
            icon: darkMode ? Moon : Sun,
            title: "Appearance",
            description: "Customize how the application looks",
            open: openSections.appearance,
            onToggle: () => toggleSection("appearance"),
            children: (
              <>
                {renderRow({
                  icon: darkMode ? Moon : Sun,
                  title: "Dark Mode",
                  description: darkMode
                    ? "Dark mode is currently enabled across the application."
                    : "Use a dark appearance throughout the application.",
                  checked: darkMode,
                  onChange: changeTheme,
                })}

                <div className="px-4 pb-4 pt-2 sm:px-6">
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-4 ${
                      darkMode
                        ? "border-indigo-800 bg-indigo-950/50"
                        : "border-indigo-100 bg-indigo-50"
                    }`}
                  >
                    {darkMode ? (
                      <Moon size={18} className="shrink-0 text-indigo-400" />
                    ) : (
                      <Sun size={18} className="shrink-0 text-indigo-600" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${darkMode ? "text-indigo-200" : "text-indigo-900"}`}
                      >
                        Current theme: {darkMode ? "Dark" : "Light"}
                      </p>
                      <p
                        className={`mt-1 text-xs ${darkMode ? "text-indigo-300" : "text-indigo-700"}`}
                      >
                        Your theme preference is automatically saved in this
                        browser.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ),
          })}

          {/* NOTIFICATIONS */}
          {renderSection({
            icon: Bell,
            title: "Notifications",
            description: "Control system and attendance notifications",
            open: openSections.notifications,
            onToggle: () => toggleSection("notifications"),
            children: (
              <>
                {renderRow({
                  icon: Mail,
                  title: "Email Notifications",
                  description:
                    "Receive important system notifications through email.",
                  checked: settings.emailNotifications,
                  onChange: (value) =>
                    updatePreferenceWithToast("emailNotifications", value),
                })}
                {renderRow({
                  icon: ClipboardCheck,
                  title: "Attendance Reminder",
                  description:
                    "Receive reminders when attendance needs to be submitted.",
                  checked: settings.attendanceReminder,
                  onChange: (value) =>
                    updatePreferenceWithToast("attendanceReminder", value),
                })}
                {renderRow({
                  icon: Bell,
                  title: "Low Attendance Alert",
                  description:
                    "Notify users when attendance falls below the required percentage.",
                  checked: settings.lowAttendanceAlert,
                  onChange: (value) =>
                    updatePreferenceWithToast("lowAttendanceAlert", value),
                })}
                {renderRow({
                  icon: Lock,
                  title: "Login Alerts",
                  description: "Receive notifications when a new login occurs.",
                  checked: settings.loginAlerts,
                  onChange: (value) =>
                    updatePreferenceWithToast("loginAlerts", value),
                })}
                {renderRow({
                  icon: Mail,
                  title: "Email Reports",
                  description:
                    "Allow attendance reports to be sent through email.",
                  checked: settings.emailReports,
                  onChange: (value) =>
                    updatePreferenceWithToast("emailReports", value),
                })}
              </>
            ),
          })}

          {/* ATTENDANCE */}
          {renderSection({
            icon: ClipboardCheck,
            title: "Attendance",
            description: "Configure attendance recording rules",
            open: openSections.attendance,
            onToggle: () => toggleSection("attendance"),
            children: (
              <>
                {renderRow({
                  icon: Save,
                  title: "Auto Save Attendance",
                  description:
                    "Automatically save attendance while marking students.",
                  checked: settings.autoSaveAttendance,
                  onChange: (value) =>
                    updatePreferenceWithToast("autoSaveAttendance", value),
                })}
                {renderRow({
                  icon: SlidersHorizontal,
                  title: "Allow Duplicate Attendance",
                  description:
                    "Allow duplicate attendance records for the same lecture and registration number.",
                  checked: settings.allowDuplicateAttendance,
                  onChange: (value) =>
                    updatePreferenceWithToast(
                      "allowDuplicateAttendance",
                      value,
                    ),
                })}

                <div
                  className={`w-full border-b px-4 py-5 sm:px-6 ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                >
                  <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"}`}
                      >
                        <ClipboardCheck size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                        >
                          Minimum Attendance
                        </h4>
                        <p
                          className={`mt-1 text-xs leading-5 sm:text-sm ${bodyText}`}
                        >
                          Minimum attendance percentage required for
                          eligibility.
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center sm:w-auto">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.minimumAttendance}
                        onChange={(event) =>
                          updateSetting(
                            "minimumAttendance",
                            Math.min(
                              100,
                              Math.max(0, Number(event.target.value)),
                            ),
                          )
                        }
                        className={`${inputClass} text-center font-semibold sm:w-24`}
                      />
                      <span
                        className={`ml-2 text-sm font-semibold ${bodyText}`}
                      >
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ),
          })}

          {/* SECURITY */}
          {renderSection({
            icon: ShieldCheck,
            title: "Security",
            description: "Manage login and session security",
            open: openSections.security,
            onToggle: () => toggleSection("security"),
            children: (
              <>
                <div className="w-full px-4 py-5 sm:px-6">
                  <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"}`}
                      >
                        <Clock3 size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                        >
                          Session Timeout
                        </h4>
                        <p
                          className={`mt-1 text-xs leading-5 sm:text-sm ${bodyText}`}
                        >
                          Automatically log out after a period of inactivity.
                        </p>
                      </div>
                    </div>

                    <select
                      value={settings.sessionTimeout}
                      onChange={(event) =>
                        updateSetting(
                          "sessionTimeout",
                          Number(event.target.value),
                        )
                      }
                      className={`${inputClass} sm:w-40`}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div
                  className={`mx-4 mb-4 rounded-xl border p-4 sm:mx-6 sm:mb-5 ${darkMode ? "border-indigo-800 bg-indigo-950/50" : "border-indigo-100 bg-indigo-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-indigo-600"
                    />
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-semibold ${darkMode ? "text-indigo-200" : "text-indigo-900"}`}
                      >
                        Security Tip
                      </h4>
                      <p
                        className={`mt-1 break-words text-xs leading-5 sm:text-sm ${darkMode ? "text-indigo-300" : "text-indigo-700"}`}
                      >
                        Use a short session timeout on shared computers and
                        always log out after completing your work.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ),
          })}

          {/* CURRENT PREFERENCES */}
          {renderSection({
            icon: Info,
            title: "Current Preferences",
            description: "View a summary of your selected settings",
            open: openSections.system,
            onToggle: () => toggleSection("system"),
            children: (
              <div className="grid w-full min-w-0 grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                <PreferenceCard
                  title="Theme"
                  value={darkMode ? "Dark Mode" : "Light Mode"}
                  darkMode={darkMode}
                />
                <PreferenceCard
                  title="Minimum Attendance"
                  value={`${settings.minimumAttendance}%`}
                  darkMode={darkMode}
                />
                <PreferenceCard
                  title="Session Timeout"
                  value={`${settings.sessionTimeout} minutes`}
                  darkMode={darkMode}
                />
                <PreferenceCard
                  title="Auto Save"
                  value={settings.autoSaveAttendance ? "Enabled" : "Disabled"}
                  darkMode={darkMode}
                />
                <PreferenceCard
                  title="Email Notifications"
                  value={settings.emailNotifications ? "Enabled" : "Disabled"}
                  darkMode={darkMode}
                />
                <PreferenceCard
                  title="Low Attendance Alert"
                  value={settings.lowAttendanceAlert ? "Enabled" : "Disabled"}
                  darkMode={darkMode}
                />
                <PreferenceCard
                  title="Duplicate Attendance"
                  value={
                    settings.allowDuplicateAttendance ? "Allowed" : "Blocked"
                  }
                  darkMode={darkMode}
                />
              </div>
            ),
          })}

          {/* SYSTEM INFORMATION */}
          <section
            className={`w-full min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5 md:p-6 ${surface}`}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600"}`}
              >
                <Info size={18} />
              </div>
              <div className="min-w-0">
                <h3
                  className={`text-base font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                >
                  System Information
                </h3>
                <p className={`mt-1 text-xs sm:text-sm ${bodyText}`}>
                  Attendance Management System
                </p>
              </div>
            </div>

            <div className="mt-5 grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Application"
                value="Attendance Management"
                darkMode={darkMode}
              />
              <InfoItem label="Version" value="1.0.0" darkMode={darkMode} />
              <InfoItem label="Database" value="MongoDB" darkMode={darkMode} />
              <InfoItem label="Status" value="Active" darkMode={darkMode} />
            </div>
          </section>

          {/* SAVE AREA */}
          <section
            className={`w-full min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5 md:p-6 ${surface}`}
          >
            <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h3
                  className={`text-sm font-bold sm:text-base ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                >
                  Save your changes
                </h3>
                <p
                  className={`mt-1 break-words text-xs leading-5 sm:text-sm ${bodyText}`}
                >
                  Save your preferences to keep them available for your next
                  session.
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                <button
                  type="button"
                  disabled={savingSettings}
                  onClick={resetSettings}
                  className={secondaryButton}
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  disabled={savingSettings}
                  onClick={saveSettings}
                  className={primaryButton}
                >
                  <Save size={16} />
                  <span>{savingSettings ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </section>

          <div className="h-8 w-full sm:h-10 md:h-12 lg:h-16" />
        </div>
      </main>
    </div>
  );
};

export default Settings;
