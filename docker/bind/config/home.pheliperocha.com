$TTL 2d
$ORIGIN home.pheliperocha.com.

@                           IN    SOA     ns.home.pheliperocha.com.   info.pheliperocha.com (
                                                                      2023111912  ; serial
                                                                      12h         ; refresh
                                                                      15m         ; retry
                                                                      3w          ; expire
                                                                      2h          ; minimum ttl
                                                                    )

                              IN    NS    ns.home.pheliperocha.com.

ns                            IN    A     192.168.1.15

; -- add dns records below

*.home.pheliperocha.com.      IN    A     192.168.49.2