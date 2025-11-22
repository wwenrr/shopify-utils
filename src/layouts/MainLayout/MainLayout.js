import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './MainLayout.module.css';

const STATUS_META = {
  success: {
    iconClass: styles.navIconSuccess,
  },
  warning: {
    iconClass: styles.navIconWarning,
  },
  danger: {
    iconClass: styles.navIconDanger,
  },
  default: {
    iconClass: styles.navIconDefault,
  },
};

const NAV_SECTIONS = [
  {
    label: 'Overview',
    routes: [
      {
        path: '/',
        label: 'Dashboard',
        exact: true,
        status: 'success',
      },
    ],
  },
  {
    label: 'Editor',
    routes: [
      {
        path: '/editor',
        label: 'Blog Editor',
        status: 'warning',
      },
    ],
  },
  {
    label: 'Generators',
    routes: [
      {
        path: '/author-generator',
        label: 'Gen HTML Author',
        status: 'success',
      },
      {
        path: '/blog-button',
        label: 'Blog Button Template',
        status: 'success',
      },
      {
        path: '/faqs',
        label: 'FAQs Template',
        status: 'success',
      },
      {
        path: '/html-alignment',
        label: 'HTML Alignment',
        status: 'success',
      },
    ],
  },
];

function MainLayout({ children }) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img
            src="https://cdn-icons-png.flaticon.com/128/6197/6197131.png"
            alt="Shopify Utils logo"
            className={styles.logo}
          />
          <div>
            <p className={styles.eyebrow}>Internal toolkit</p>
            <h1 className={styles.title}>Shopify Utils</h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.status}>Beta</span>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className={styles.navSection}>
                <p className={styles.navLabel}>{section.label}</p>
                {section.routes.map((route) => (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    end={route.exact}
                    className={({ isActive }) => getNavLinkClassName(isActive)}
                  >
                    <span className={styles.navLinkContent}>
                      {renderNavIcon(route.status)}
                      <span className={styles.navLabelText}>{route.label}</span>
                    </span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

function getNavLinkClassName(isActive) {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
}

function renderNavIcon(status = 'default') {
  const meta = STATUS_META[status] ?? STATUS_META.default;
  return <span className={`${styles.navIcon} ${meta.iconClass}`} aria-hidden="true" />;
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;

