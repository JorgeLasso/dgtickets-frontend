const getUserStorage = () => {
  return {
    userName: localStorage.getItem("userName"),
    module: localStorage.getItem("module"),
  };
};

export default getUserStorage;
