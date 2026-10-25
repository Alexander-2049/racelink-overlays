/**
 * Every problem the overlay validator can report. Codes are a stable public
 * contract: docs/overlay-api/errors.md explains each of them.
 */
export const issueCodes = [
  'MANIFEST_MISSING',
  'MANIFEST_JSON',
  'MANIFEST_FIELD',
  'API_VERSION_UNSUPPORTED',
  'ENTRY_MISSING',
  'PATH_OUTSIDE_PACKAGE',
  'SETTING_FIELD',
  'SETTING_KEY_DUPLICATE',
  'SETTING_DEFAULT_TYPE',
  'SETTING_DEFAULT_RANGE',
  'SETTING_OPTION_DUPLICATE',
  'SETTING_VISIBLE_IF',
  'PREVIEW_MISSING',
  'PREVIEW_FORMAT',
  'PREVIEW_TOO_LARGE',
  'PREVIEW_DIMENSIONS',
  'SCREENSHOT_LIMIT',
  'FILE_TYPE_NOT_ALLOWED',
  'FILE_HIDDEN',
  'PACKAGE_TOO_LARGE',
  'PACKAGE_TOO_MANY_FILES',
  'REQUIRED_FIELD_UNKNOWN',
  'PACKAGE_NOT_BUILT',
  'PACKAGE_STALE',
] as const;
export type IssueCode = (typeof issueCodes)[number];

export type Issue = Readonly<{
  code: IssueCode;
  severity: 'error' | 'warning';
  /** JSON path inside the manifest, or a package-relative file path. */
  path: string;
  message: string;
}>;

export const error = (code: IssueCode, path: string, message: string): Issue => ({
  code,
  severity: 'error',
  path,
  message,
});

export const warning = (code: IssueCode, path: string, message: string): Issue => ({
  code,
  severity: 'warning',
  path,
  message,
});

export const hasErrors = (issues: readonly Issue[]): boolean =>
  issues.some((issue) => issue.severity === 'error');

/** `settings.pages[0].groups[1].settings[2].default: 50 > max 40 [SETTING_DEFAULT_RANGE]` */
export const formatIssue = (issue: Issue): string =>
  `${issue.severity === 'warning' ? 'warning: ' : ''}${issue.path}: ${issue.message} [${issue.code}]`;
