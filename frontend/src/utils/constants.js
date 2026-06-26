export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const APP_NAME = import.meta.env.VITE_APP_NAME || "Cité d'Innovation UCA";

export const TOKEN_KEY = 'cim_token';

export const AUTH_STORAGE_KEY = 'cim-auth';

export const ROLES = {
  ADMIN_RES: 'ADMIN_RES',
  ADMIN_EVT: 'ADMIN_EVT',
  DEMANDEUR: 'DEMANDEUR',
};

export const ADMIN_ROLES = [
  ROLES.ADMIN_RES,
  ROLES.ADMIN_EVT,
];

export const RESERVATION_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDEE: 'VALIDEE',
  REJETEE: 'REJETEE',
  ANNULEE: 'ANNULEE',
  CONFIRMEE: 'CONFIRMEE',
  TERMINEE: 'TERMINEE',
  ARCHIVEE: 'ARCHIVEE',
};

export const LOCAL_STATUS = {
  DISPONIBLE: 'DISPONIBLE',
  MAINTENANCE: 'MAINTENANCE',
  HORS_SERVICE: 'HORS_SERVICE',
};

export const PUBLICATION_STATUS = {
  BROUILLON: 'BROUILLON',
  PUBLIE: 'PUBLIE',
  ARCHIVEE: 'ARCHIVEE',
};

/** Tailwind class maps for Badge / status UI */
export const STATUS_COLORS = {
  [RESERVATION_STATUS.EN_ATTENTE]: 'bg-[#F59E0B] text-white border-transparent',
  [RESERVATION_STATUS.VALIDEE]: 'bg-[#10B981] text-white border-transparent',
  [RESERVATION_STATUS.CONFIRMEE]: 'bg-[#10B981] text-white border-transparent',
  [RESERVATION_STATUS.REJETEE]: 'bg-[#EF4444] text-white border-transparent',
  [RESERVATION_STATUS.ANNULEE]: 'bg-[#64748B] text-white border-transparent',
  [RESERVATION_STATUS.TERMINEE]: 'bg-[#3B82F6] text-white border-transparent',
  [RESERVATION_STATUS.ARCHIVEE]: 'bg-[#64748B] text-white border-transparent',  // ✅ AJOUTÉ
  [LOCAL_STATUS.DISPONIBLE]: 'bg-[#10B981] text-white border-transparent',
  [LOCAL_STATUS.MAINTENANCE]: 'bg-[#F59E0B] text-white border-transparent',
  [LOCAL_STATUS.HORS_SERVICE]: 'bg-[#64748B] text-white border-transparent',
  [PUBLICATION_STATUS.BROUILLON]: 'bg-[#64748B] text-white border-transparent',
  [PUBLICATION_STATUS.PUBLIE]: 'bg-[#10B981] text-white border-transparent',
  [PUBLICATION_STATUS.ARCHIVEE]: 'bg-[#64748B] text-white border-transparent',  // ✅ CORRIGÉ
  default: 'bg-[#1E293B] text-[#94A3B8] border-[#334155]',
};

export const DEFAULT_PAGE_SIZE = 10;