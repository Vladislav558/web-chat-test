import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatHeader.module.scss";
import { Avatar, IconButton, Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import { FaSignOutAlt, FaUsers } from "react-icons/fa";
import { useAuth } from "@/stores/useAuth";
import { useNavigate } from "react-router-dom";
import { ChatHeaderProps } from "@/types/ui";
import { OnlineUser } from "@/types/chat";

const ChatHeader: React.FC<ChatHeaderProps> = ({ isSticky, users, currentUser }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }

    let { clientX: left, clientY: top } = e;
    const menuWidth = 220;
    const menuHeight = 250;

    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 10;
    if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight - 10;

    setMenuPosition({ top, left });
    setIsMenuOpen(true);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const formatName = (user: OnlineUser) => {
    return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  };

  const getAvatar = (user: OnlineUser) => {
    if (user.profilePicture) return user.profilePicture;
    
    const initials = user.firstName[0] + (user.lastName ? user.lastName[0] : "");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&bold=true`;
  };

  return (
    <div className={`${styles.chatHeader} ${isSticky ? styles.sticky : ""}`}>
      <div className={styles.profile}>
        <Avatar src={currentUser.avatar} alt={currentUser.name} />
        <span className={styles.username}>{currentUser.name}</span>
      </div>

      <div className={styles.actions}>
        <IconButton
          sx={{
            fontSize: "24px",
            color: "white",
            marginRight: "10px",
            "&:hover": { color: "var(--primary-color)" },
          }}
          onClick={handleOpenMenu}
        >
          <FaUsers />
          <span className={styles.onlineCount}>{users.length}</span>
        </IconButton>

        <IconButton
          sx={{
            fontSize: "24px",
            color: "white",
            marginRight: "20px",
            "&:hover": { color: "var(--primary-color)" },
          }}
          onClick={() => setIsLogoutDialogOpen(true)}
        >
          <FaSignOutAlt />
        </IconButton>
      </div>

      {isMenuOpen && menuPosition && (
        <div
          ref={menuRef}
          className={styles.userMenu}
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <div className={styles.userList}>
            <span className={styles.sectionTitle}>Онлайн ({users.length})</span>
            {users.length === 0 ? (
              <span className={styles.noUsers}>Нет пользователей онлайн</span>
            ) : (
              users.map(user => (
                <div key={user.id} className={styles.userItem}>
                  <Avatar src={getAvatar(user)} alt={formatName(user)} className={styles.userAvatar} />
                  <span className={styles.userName}>{formatName(user)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Dialog 
        open={isLogoutDialogOpen} 
        onClose={() => setIsLogoutDialogOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#252525",
            color: "white",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
          }}
        >
          Выйти из аккаунта?
        </DialogTitle>
        <DialogActions sx={{ display: "flex", justifyContent: "space-between", padding: "10px 20px" }}>
          <Button
            onClick={() => setIsLogoutDialogOpen(false)}
            sx={{
              color: "white",
              margih: "0",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleLogout}
            sx={{
              color: "white",
              margih: "0",
              backgroundColor: "var(--primary-color)",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.8)" },
            }}
          >
            Выйти
          </Button>
        </DialogActions>
      </Dialog>
          </div>
  );
};

export default ChatHeader;
