import Instagram from "@/assets/images/home/instagram.png";
import Facebook from "@/assets/images/home/facebook.png";
import React from 'react';
import Image from 'next/image';


const SocialMedia: React.FC = () => {
    const socialLinks = [
        {
            href: "https://www.facebook.com/brownoutingclub/",
            src: Facebook.src,
            alt: "Facebook",
            label: "Visit our Facebook page",
        },
        {
            href: "https://www.instagram.com/brownoutingclub/?hl=en",
            src: Instagram.src,
            alt: "Instagram",
            label: "Visit our Instagram profile",
        },
    ];

    return (
        <div className="flex space-x-10">
            {socialLinks.map(({ href, src, alt, label }, index) => (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                >
                    <Image 
                        src={src} 
                        alt={alt} 
                        width={40} 
                        height={40} 
                        priority 
                    />
                </a>
            ))}
        </div>
    );
};

export default SocialMedia;




