export default {
  methods: {
    warningShouldFlash(warning) {
      if (!warning) return false;

      return SEVERITY_VALUES[warning.severity.toUpperCase()] >= SEVERITY_VALUES.MODERATE;
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
