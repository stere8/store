import Sidebar from"../UI/dashboard/sidebar/sidebar"
import Navbar from"../UI/dashboard/navbar/navbar"
import Styles from"../UI/dashboard/dashboard.module.css"

const Layout = ({children}) => {
  return (
    <div className={Styles.container}>
         <div className ={Styles.menu}> 
            <Sidebar/>
        </div>
        <div className={Styles.content}>
           <Navbar/> 
           {children}
        </div>
    </div>  
            )
}

export default Layout