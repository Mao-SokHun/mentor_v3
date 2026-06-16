const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

const getPagination = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  if (isNaN(limit) || limit < MIN_LIMIT) {
    limit = DEFAULT_LIMIT;
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const offset = (page - 1) * limit;

  return { 
    page, 
    limit, 
    offset,
    dbOptions: {
      limit,
      offset
    }
  };
};

const getSearchParams = (query = {}, allowedFields = []) => {
  const search = {};
  
  allowedFields.forEach(field => {
    if (query[field] !== undefined && query[field] !== '') {
      search[field] = query[field];
    }
  });


  if (query.search && typeof query.search === 'string' && query.search.trim() !== '') {
    search.search = query.search.trim();
  }

  if (query.sortBy) {
    search.sortBy = query.sortBy;
    search.sortOrder = query.sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  }

  return search;
};

const buildPaginationMeta = (page, limit, totalItems) => {
  const safeTotalItems = Math.max(0, parseInt(totalItems, 10) || 0);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(MAX_LIMIT, parseInt(limit, 10) || DEFAULT_LIMIT));
  
  const totalPages = safeTotalItems === 0 ? 1 : Math.ceil(safeTotalItems / safeLimit);

  return {
    page: safePage,
    limit: safeLimit,
    totalItems: safeTotalItems,
    totalPages
  };
};

const buildSortOrder = (query = {}, allowedSortFields = [], defaultSort = 'create_date') => {
  const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : defaultSort;
  const sortOrder = query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  return [[sortBy, sortOrder]];
};

const buildSearchWhere = (searchTerm, fields, Op) => {
  if (!searchTerm || !fields || fields.length === 0) {
    return {};
  }

  const trimmedTerm = searchTerm.trim();
  if (trimmedTerm === '') {
    return {};
  }

  return {
    [Op.or]: fields.map(field => ({
      [field]: { [Op.iLike]: `%${trimmedTerm}%` }
    }))
  };
};

const paginate = (page, limit) => ({
  limit,
  offset: (page - 1) * limit
});

export {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_LIMIT,
  getPagination,
  getSearchParams,
  buildPaginationMeta,
  buildSortOrder,
  buildSearchWhere,
  paginate
};