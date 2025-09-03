import { Navigate } from "react-router";

const publicRoutes = {
  id: "public",
  children: [
    {
      index: true,
      element: <Navigate to="/login" replace />,
    },
    {
      path: "*",
      element: <Navigate to="/login" replace />,
    },
  ],
};

export { publicRoutes };
