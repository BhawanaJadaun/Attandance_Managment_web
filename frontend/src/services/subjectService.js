import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getSubjects = () => {
  return apiGet("/api/subjects/");
};

export const createSubject = (subjectData) => {
  return apiPost("/api/subjects/", subjectData);
};

export const updateSubject = (subjectId, subjectData) => {
  return apiPut(`/api/subjects/${encodeURIComponent(subjectId)}`, subjectData);
};

export const deleteSubject = (subjectId) => {
  return apiDelete(`/api/subjects/${encodeURIComponent(subjectId)}`);
};

export const subjectService = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};

export default subjectService;
