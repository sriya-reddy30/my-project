"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../components/navbar.module.css";

interface Profile {
  name: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "John Doe",
    email: "johndoe@example.com",
  });

  const handleLogout = () => {
    localStorage.removeItem("userToken"); // adjust according to your auth
    router.push("/login");
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleClosePopup = () => {
    setShowProfile(false);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save profile logic here (API call or localStorage)
    console.log("Saved profile:", profile);
    setIsEditing(false);
    setShowProfile(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.shopName}>SAI OPTICALS</div>
      <div className={styles.actions}>
        <div className={styles.profile} onClick={handleProfileClick}>
          Profile
        </div>
        <div className={styles.logout} onClick={handleLogout}>
          Logout
        </div>
      </div>

      {showProfile && (
        <div className={styles.profilePopup}>
          <button className={styles.closeButton} onClick={handleClosePopup}>
            &times;
          </button>

          {isEditing ? (
            <div className={styles.editForm}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                />
              </label>
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
            </div>
          ) : (
            <div className={styles.profileDetails}>
              <p>
                <strong>Name:</strong> {profile.name}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <button className={styles.editButton} onClick={handleEditToggle}>
                Edit Details
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
