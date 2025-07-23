import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
// import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button, Link, InputProps } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };



  const DrawerList = (
    <Box sx={{ 
      width: 250, 
      backgroundColor: "#000000", 
      minHeight: "100vh",
      height: "100%"
    }}  role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <a className="MenuLinks" href="/">
      <ListItem >
        <ListItemText disableTypography primaryTypographyProps={{fontSize: '1.5rem', color: '#36bffa'}} primary="Home" />
   </ListItem>
   </a>
  
   <a className="MenuLinks" href="/tag">
   <ListItem >
        <ListItemText disableTypography primaryTypographyProps={{fontSize: '1.5rem', color: '#ffffff'}} primary="Tag" />
   </ListItem>
   </a>
   
   <a className="MenuLinks" href="/bountyfoxes">
   <ListItem >
        <ListItemText disableTypography primaryTypographyProps={{fontSize: '1.5rem', color: '#ffffff'}} primary="Bounty Foxes" />
   </ListItem>
   </a>
   <a className="MenuLinks" href="/mobilefriendlyfoxes">
   <ListItem >
        <ListItemText disableTypography primaryTypographyProps={{fontSize: '1.5rem', color: '#ffffff'}} primary="Mobile-Friendly Foxes" />
   </ListItem>
   </a>
  

      </List>
    </Box>
  );

  return (
    <div className="Hamburger">
      <Button onClick={toggleDrawer(true)}><MenuIcon className="svg_icons"/></Button>
      <Drawer 
        open={open} 
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#000000",
            width: 250
          }
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
