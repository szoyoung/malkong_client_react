export const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data.message || '서버 오류가 발생했습니다.';
  }
  return error.message || '알 수 없는 오류가 발생했습니다.';
}; 