// import { Modal, useMantineTheme } from "@mantine/core";
// import PostShare from "../PostShare/PostShare";
// function ShareModal({ modalOpened, setModalOpened }) {
// const theme = useMantineTheme();
// return (
// <Modal
//       overlayColor={
//         theme.colorScheme === "dark"
// ? theme.colors.dark[9]
// : theme.colors.gray[2]
// }
//       overlayOpacity={0.55}
//       overlayBlur={3}
//       size="55%"
//       opened={modalOpened}
//       onClose={() => setModalOpened(false)}
// >
// <PostShare/>
// </Modal>
// );
// }
// export default ShareModal;
const ShareModal = ({ modalOpened, setModalOpened }) => {
  if (!modalOpened) return null;

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h3>Share Modal Works</h3>
      <button onClick={() => setModalOpened(false)}>Close</button>
    </div>
  );
};

export default ShareModal;
