import styled from '@emotion/styled'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { LoadingButton } from '@mui/lab'
import { Container, FormControl, IconButton, InputAdornment, InputLabel, Link, OutlinedInput, Stack, TextField, Typography } from '@mui/material'
import axios from 'axios'
import { MuiOtpInput } from 'mui-one-time-password-input'
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import Iconify from 'src/components/iconify'
import Logo from 'src/components/logo'
import useResponsive from 'src/hooks/useResponsive'

const StyledRoot = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    },
}))

const StyledSection = styled('div')(({ theme }) => ({
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: theme.customShadows.card,
    backgroundColor: theme.palette.background.default,
}))

const StyledContent = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
}))

export default function ForgetPassword() {
    const { t } = useTranslation()
    const navigate = useNavigate();
    const mdUp = useResponsive('up', 'md')
    const [userInfo, setUserInfo] = useState({
        email: '',
        password: '',
        otp: '',
    })
    const [otpMode, setOtpMode] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const apiUrl = process.env.REACT_APP_BASE_URL

    const handleClickShowPassword = () => setShowPassword((show) => !show)

    const resetPassword = async (e) => {
        e.preventDefault()
        if (otpMode) {
            try {
                const response = await axios.post(`${apiUrl}/admin_management/reset`, {
                    email: userInfo.email,
                    otp: userInfo.otp,
                    password: userInfo.password
                })
                if (response?.data?.results?.affectedRows > 0) {
                    alert(response?.data?.message)
                    setOtpMode(true)
                    navigate("/login")
                } else {
                    alert('Otp did not match')
                }
            } catch (error) {
                console.error(error)
            }
        } else {
            try {
                const response = await axios.post(`${apiUrl}/admin_management/forgot`, {
                    email: userInfo.email,
                })
                if (response?.data?.results?.affectedRows > 0) {
                    alert(response?.data?.message)
                    setOtpMode(true)
                } else {
                    alert('No User found')
                }
            } catch (error) {
                console.error(error)
            }
        }
    }
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <>
            <Helmet>
                <title>{t('Reset Password | DocGIS ')}</title>
            </Helmet>

            <StyledRoot>
                <Logo
                    sx={{
                        position: 'fixed',
                        top: { xs: 16, sm: 24, md: 40 },
                        left: { xs: 16, sm: 24, md: 40 },
                    }}
                />

                {mdUp && (
                    <StyledSection>
                        <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
                            {t('Hi, Welcome Back')}
                        </Typography>
                        <img src="/assets/illustrations/illustration_login.png" alt="login" />
                    </StyledSection>
                )}

                <Container maxWidth="sm">
                    <StyledContent>
                        <Typography variant="h4" gutterBottom>
                            {t('Reset Password')}
                        </Typography>
                        <Stack spacing={3}>
                            <TextField
                                name="email"
                                label="Email address"
                                value={userInfo.email}
                                onChange={(e) => setUserInfo({ ...userInfo, [e.target.name]: e.target.value })}
                                disabled={otpMode}
                            />
                            {otpMode && (
                                <>
                                    <MuiOtpInput
                                        value={userInfo.otp}
                                        onChange={(e) => setUserInfo({ ...userInfo, "otp": e })}
                                        length={4}
                                    />

                                    <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
                                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                        <OutlinedInput
                                            value={userInfo.password}
                                            id="outlined-adornment-password"
                                            type={showPassword ? 'text' : 'password'}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="New Password"
                                            name="password"
                                            onChange={(e) => setUserInfo({ ...userInfo, [e.target.name]: e.target.value })}
                                        />
                                    </FormControl>
                                </>
                            )}
                        </Stack>

                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
                            {/* <Checkbox name="remember" label="Remember me" /> */}
                            <Link variant="subtitle2" underline="hover" href="/login">
                                Remember Password
                            </Link>
                        </Stack>

                        <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={resetPassword}>
                            {
                                otpMode ?
                                    "Reset Password" :
                                    "Send Otp"
                            }
                        </LoadingButton>
                    </StyledContent>
                </Container>
            </StyledRoot>
        </>
    )
}
