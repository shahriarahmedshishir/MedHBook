import React from 'react';
import Header from '../Shared/Header';
import Footer from '../Shared/Footer';
import PatientHome from '../../Pages/PatientHome';
import { Outlet } from 'react-router';

const RootLayout = () => {
    return (
        <div className=''>
            <Header/>
            <Outlet/>
            <Footer/>
        </div>
    );
};

export default RootLayout;