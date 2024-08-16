import React from "react";
import Layout from "./components/Layout";
import { AuthContextProvider } from "./context/AuthContext";
import { ToastContextProvider } from "./context/ToastContext";
import { Routes as Switch, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateContact from "./pages/CreateContact";
import AllContacts from "./pages/AllContacts";
import EditContact from "./pages/EditContact";

function App() {
  return (
    <ToastContextProvider>
      <AuthContextProvider>
        <Layout>
          <Switch>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create" element={<CreateContact />} />
            <Route path="/mycontacts" element={<AllContacts />} />
            <Route path="/edit/:id" element={<EditContact />} />
          </Switch>
        </Layout>
      </AuthContextProvider>
    </ToastContextProvider>
  );
}

export default App;
