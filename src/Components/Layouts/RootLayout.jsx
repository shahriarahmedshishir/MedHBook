import React from 'react';
import Header from '../Shared/Header';
import Footer from '../Shared/Footer';
import PatientHome from '../../Pages/PatientHome';

const RootLayout = () => {
    return (
        <div className=''>
            <Header/>
            <PatientHome/>
            <Footer/>
        </div>
    );
};

export default RootLayout;