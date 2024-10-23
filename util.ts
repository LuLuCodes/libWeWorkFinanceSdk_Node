export const safetyParseJson = (str) => {
  let result = null;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return null;
  }
  return result;
};
