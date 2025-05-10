import { useState, useEffect, useCallback } from "react";
import useFetch from "./useFetch";
import { User } from "../types/user/user.types";
import {
  PaginatedResponse,
  PaginationOptions,
} from "../types/pagination/pagination.types";

interface UsersResponse extends Omit<PaginatedResponse<User>, "items"> {
  users: User[];
}

const useUsers = (options: PaginationOptions = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const { get, put, post, isLoading } = useFetch<UsersResponse>();
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);
  const [limit] = useState(options.limit || 8);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchUsers = useCallback(
    async (
      page: number = currentPage,
      append: boolean = false,
      search: string = searchTerm
    ) => {
      try {
        setError(null);
        let url = `users?page=${page}&limit=${limit}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await get(url);
        if (response && response.users) {
          setUsers((prevUsers) =>
            append ? [...prevUsers, ...response.users] : response.users
          );
          setTotalUsers(response.total);
          setHasNextPage(!!response.next);
        } else {
          setError("No se pudo obtener la información de usuarios.");
        }
      } catch (error) {
        console.error("Error al cargar la lista de usuarios:", error);
        setError(
          "Error al cargar la lista de usuarios. Por favor, intenta nuevamente."
        );
      }
    },
    [currentPage, limit, get, searchTerm]
  );

  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  const filterUsers = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      fetchUsers(1, false, term);
    },
    [fetchUsers]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchUsers(currentPage + 1, true).finally(() => {
        setCurrentPage((prevPage) => prevPage + 1);
        setIsLoadingMore(false);
      });
    }
  }, [fetchUsers, currentPage, hasNextPage, isLoadingMore]);
  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchUsers(page);
    },
    [fetchUsers]
  );
  const updateUser = useCallback(
    async (userId: number, userData: Partial<Omit<User, "id">>) => {
      try {
        const response = await put(`users/${userId}`, userData);

        if (response && response.success) {
          // Refresh user list after successful update
          await fetchUsers(currentPage);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating user:", error);
        return false;
      }
    },
    [currentPage, fetchUsers, put]
  );

  const createUser = useCallback(
    async (userData: Partial<Omit<User, "id">>) => {
      try {
        const response = await post("users", userData);

        if (response && response.success) {
          // Refresh user list after successful creation
          await fetchUsers(currentPage);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creating user:", error);
        return false;
      }
    },
    [currentPage, fetchUsers, post]
  );
  return {
    users,
    totalUsers,
    currentPage,
    totalPages: Math.ceil(totalUsers / limit),
    error,
    isLoading: isLoading || isLoadingMore,
    fetchUsers,
    loadMore,
    setPage,
    filterUsers,
    setSearchTerm,
    updateUser,
    createUser,
  };
};

export default useUsers;
