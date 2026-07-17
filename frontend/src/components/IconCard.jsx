export default function IconCard({ icon: Icon, title, children }) {
  return <article className="icon-card"><span className="icon-wrap"><Icon /></span><h3>{title}</h3><p>{children}</p></article>;
}
