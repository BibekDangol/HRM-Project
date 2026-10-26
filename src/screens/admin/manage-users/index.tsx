import React from "react";
import UserDirectoryList from "../components/UserDirectoryList";

export default function ManageUsers() {
  return (
    <UserDirectoryList
      mode="manage"
      searchPlaceholder="Search by name or email..."
    />
  );
}