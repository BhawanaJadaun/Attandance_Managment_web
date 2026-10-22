
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from "react";

import { apiGet } from "../services/api.js";

const ProfessorsContext = createContext(null);

// Reducer
const professorReducer = (state, action) => {
  switch (action.type) {
    case "ADD_PROFESSOR":
      return [action.payload, ...state];

    case "UPDATE_PROFESSOR":
      return state.map((professor) => {
        const professorKey =
          professor._id ??
          professor.id ??
          professor.professor_id ??
          professor.professorId;

        const updatedKey =
          action.payload._id ??
          action.payload.id ??
          action.payload.professor_id ??
          action.payload.professorId;

        return String(professorKey) === String(updatedKey)
          ? { ...professor, ...action.payload }
          : professor;
      });

    case "DELETE_PROFESSOR":
      return state.filter((professor) => {
        const key =
          professor._id ??
          professor.id ??
          professor.professor_id ??
          professor.professorId;

        return String(key) !== String(action.payload);
      });

    case "SET_PROFESSORS":
      return Array.isArray(action.payload)
        ? action.payload
        : [];

    case "CLEAR_PROFESSORS":
      return [];

    default:
      return state;
  }
};

// Provider
export const ProfessorsProvider = ({ children }) => {
  const [professors, dispatch] = useReducer(
    professorReducer,
    []
  );

  useEffect(() => {
    let cancelled = false;

    const loadProfessors = async () => {
      try {
        const response = await apiGet("/api/professors/");

        const savedProfessors = Array.isArray(response)
          ? response
          : response?.professors ??
            response?.data ??
            [];

        if (!cancelled) {
          dispatch({
            type: "SET_PROFESSORS",
            payload: savedProfessors,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load professors from MongoDB:",
          error
        );

        if (!cancelled) {
          dispatch({
            type: "SET_PROFESSORS",
            payload: [],
          });
        }
      }
    };

    loadProfessors();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      professors,
      dispatch,
    }),
    [professors]
  );

  return (
    <ProfessorsContext.Provider value={value}>
      {children}
    </ProfessorsContext.Provider>
  );
};

// Hook
export const useProfessors = () => {
  const context = useContext(ProfessorsContext);

  if (!context) {
    throw new Error(
      "useProfessors must be used inside ProfessorsProvider"
    );
  }

  return context;
};

export default ProfessorsContext;
