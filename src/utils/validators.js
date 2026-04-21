(function () {
  window.App = window.App || {};

  function normalize(value) {
    return String(value || "").trim();
  }

  function isBlank(value) {
    return normalize(value) === "";
  }

  function isPhoneNumber(value) {
    const digits = normalize(value).replaceAll("-", "");
    return /^01\d{8,9}$/.test(digits);
  }

  function isPositiveNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0;
  }

  function isRangeValid(minValue, maxValue) {
    if (!minValue || !maxValue) {
      return true;
    }

    return Number(minValue) <= Number(maxValue);
  }

  function hasDuplicateValues(values) {
    const normalizedValues = values
      .map(function (value) {
        return normalize(value);
      })
      .filter(Boolean);

    return new Set(normalizedValues).size !== normalizedValues.length;
  }

  function collectRequiredErrors(fields) {
    const errors = {};

    fields.forEach(function (field) {
      if (isBlank(field.value)) {
        errors[field.key] = field.message || "필수 입력 항목입니다.";
      }
    });

    return errors;
  }

  window.App.validators = {
    normalize: normalize,
    isBlank: isBlank,
    isPhoneNumber: isPhoneNumber,
    isPositiveNumber: isPositiveNumber,
    isRangeValid: isRangeValid,
    hasDuplicateValues: hasDuplicateValues,
    collectRequiredErrors: collectRequiredErrors
  };
})();
