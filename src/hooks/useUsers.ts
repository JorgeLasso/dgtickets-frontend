import { useState, useEffect, useCallback } from "react";
import useFetch from "./useFetch";
import { User, UsersResponse } from "../types/user/user.types";

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  fetchUsers: () => Promise<void>;
}

const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const { get, isLoading, error } = useFetch<UsersResponse>();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await get("users");
      if (data && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [get]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
  };
};

export default useUsers;
