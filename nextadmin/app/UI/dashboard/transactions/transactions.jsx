import styles from './transactions.module.css';

const transactions = () => {
  return (
    <div className={styles.container}>
     <h2 className={styles.title}>Latest Transactions</h2>
     <table className={styles.table}>
        <thead>
            <tr className={styles.tr}>
                <td className={styles.th}>Customer</td>
                <td className={styles.th}>Date</td>
                <td className={styles.th}>Amount</td>
                <td className={styles.th}>Status</td>
            </tr>
        </thead>
        <tbody>
            <tr className={styles.tr}>
                <td className={styles.user}>
                    <img src="/noavatar.png" 
                      alt="" 
                      width={40}
                      height={40}
                      className={styles.img} />
                    <span className={styles.name}>John Doe</span>
                </td>
                <td className={styles.date}>2024-06-15</td>
                <td className={styles.amount}>$150.00</td>
                <td className={styles.status}>
                    <span className={`${styles.status} ${styles.approved}`}>Approved</span>
                </td>
            </tr>
            <tr className={styles.tr}>
                <td className={styles.user}>
                    <img src="/noavatar.png" 
                      alt="" 
                      width={40}
                      height={40}
                      className={styles.img} 
                      />
                    <span className={styles.name}>Jane Smith</span>
                </td>
                <td className={styles.date}>2024-06-14</td>
                <td className={styles.amount}>$200.00</td>
                <td className={styles.status}>
                    <span className={`${styles.status} ${styles.declined}`}>Declined</span>
                </td>
            </tr>
            <tr className={styles.tr}>
                <td className={styles.user}>
                    <img src="/noavatar.png" 
                      alt="" 
                      width={40}
                      height={40}
                      className={styles.img} />
                    <span className={styles.name}>Alice Johnson</span>
                </td>
                <td className={styles.date}>2024-06-13</td>
                <td className={styles.amount}>$300.00</td>
                <td className={styles.status}>
                    <span className={`${styles.status} ${styles.pending}`}>Pending
                    </span>
                </td>
            </tr>
        </tbody>
     </table>       
    </div>
        );
};

export default transactions;