import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const [imageMessages, setImageMessages] = useState([]); // 用于存储聊天记录中的图片消息
  // 控制文件显示隐藏
  const [showFiles, setShowFiles] = useState(false);

  // 监听聊天记录，提取带有图片的消息
  useEffect(() => {
    if (!chatId) return; // 如果没有聊天 ID，直接返回

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      const chatData = res.data();
      if (chatData?.messages) {
        const images = chatData.messages.filter((message) => message.img); // 筛选出包含图片的消息
        setImageMessages(images); // 更新状态
      }
    });

    return () => {
      unSub(); // 组件卸载时取消订阅
    };
  }, [chatId]);

  // 屏蔽/取消屏蔽功能
  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock(); // 更改屏蔽状态
    } catch (err) {
      console.log(err);
    }
  };

  // 退出功能
  const handleLogout = () => {
    auth.signOut(); // Firebase 退出登录
    resetChat(); // 重置聊天状态
  };

  // 切换文件显示/隐藏
  const toggleFiles = () => {
    setShowFiles((prev) => !prev);
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>{user?.sign}</p>
      </div>
      <div className="info">
        {/* 显示图片文件 */}
        <div className="option">
          <div
            className="title"
            onClick={toggleFiles}
            style={{ cursor: "point" }}
          >
            <span>文件</span>
            <img
              src={showFiles ? "./arrowUp.png" : "./arrowDown.png"} //动态切换图标
              alt="toggle"
            />
          </div>
          {/* 根据showFiles状态控制文件的显示/隐藏 */}
          {showFiles && (
            <div className="photos">
              {imageMessages.length > 0 ? (
                imageMessages.map((message, index) => (
                  <div key={index} className="photoItem">
                    <div className="photoDetail">
                      <img src={message.img} alt={`photo_${index}`} />
                      <span>{`photo_${index + 1}.png`}</span>{" "}
                      {/* 这里可以使用图片的索引作为文件名 */}
                    </div>
                    <img src="./download.png" alt="download" className="icon" />
                  </div>
                ))
              ) : (
                <p>没有图片文件</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="button">
        {/* 屏蔽用户按钮 */}
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "您已被屏蔽！"
            : isReceiverBlocked
            ? "已屏蔽该用户"
            : "屏蔽用户"}
        </button>
        {/* 退出按钮 */}
        <button className="logout" onClick={handleLogout}>
          退出
        </button>
      </div>
    </div>
  );
};

export default Detail;
