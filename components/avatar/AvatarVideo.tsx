import { forwardRef } from "react";

interface AvatarVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  className?: string;
}

export const AvatarVideo = forwardRef<HTMLVideoElement, AvatarVideoProps>(
  ({ className, ...props }, ref) => {
    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={false}
        className={className || "w-full h-full object-cover"}
        style={{
          transform: "scaleX(-1)", // Mirror the video for natural interaction
        }}
        {...props}
      />
    );
  }
);

AvatarVideo.displayName = "AvatarVideo";