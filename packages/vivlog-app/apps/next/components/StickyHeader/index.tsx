import styles from './styles.module.css';

export interface FixedHeaderProps {
    children: React.ReactNode;
}

function FixedHeader({ children }: FixedHeaderProps) {
    return (
        <>
            <div className={styles.sticky}>
                {children}
            </div>
            {/* // prevent covering by fixed header */}
            <div style={{ height: 64 }}></div>

        </>
    );
}

export default FixedHeader;
