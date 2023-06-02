export default {
  methods: {
    warningShouldFlash(warning) {
      if (!warning) return false;

      return SEVERITY_VALUES[warning.severity.toUpperCase()] >= SEVERITY_VALUES.MODERATE;
    },

    sortWarnings(warnings) {
      return (
        warnings?.sort((a, b) => {
          // sort by severity
          const aSeverity = SEVERITY_VALUES[a.severity.toUpperCase()];
          const bSeverity = SEVERITY_VALUES[b.severity.toUpperCase()];
          if (aSeverity > bSeverity) return -1;
          if (bSeverity > aSeverity) return 1;

          // then by urgency
          const aUrgency = URGENCY_VALUES[a.urgency.toUpperCase()];
          const bUrgency = URGENCY_VALUES[b.urgency.toUpperCase()];
          if (aUrgency > bUrgency) return -1;
          if (bUrgency > aUrgency) return 1;

          // both the same
          return 0;
        }) || []
      );
    },
  },
};

export const SEVERITY_VALUES = {
  UNKNOWN: 0,
  MINOR: 1,
  MODERATE: 2,
  SEVERE: 3,
  EXTREME: 4,
};

export const URGENCY_VALUES = {
  UNKNOWN: 0,
  PAST: 1,
  FUTURE: 2,
  EXPECTED: 3,
  IMMEDIATE: 4,
};
