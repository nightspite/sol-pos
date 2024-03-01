import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

interface UserAvatarProps {
  name?: string | null;
  className?: string;
}

export function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("h-16 w-16", className)}>
      {/* <AvatarImage
        alt={name}
        className="object-cover"
        src={user?.avatarUrl || undefined}
      /> */}
      <AvatarFallback className="uppercase">
        {name ? name?.substring(0, 2) : "👤"}
      </AvatarFallback>
    </Avatar>
  );
}
