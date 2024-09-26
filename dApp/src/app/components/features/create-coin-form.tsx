import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { XIcon } from "lucide-react";
import { useAtom } from "jotai";
import { isDeployingAtom } from "@/lib/utils";

interface MemeCoinLaunchpadFormProps {
  onHandleSubmit: (formData: {
    coinName: string;
    coinDescription: string;
    logoUrl: string;
    twitterHandle: string;
    investment: number;
  }) => void;
}

export default function MemeCoinLaunchpadForm({
  onHandleSubmit,
}: MemeCoinLaunchpadFormProps) {
  const [logoUrl, setLogoUrl] = useState("");
  const [coinName, setCoinName] = useState("");
  const [coinDescription, setCoinDescription] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [investment, setInvestment] = useState<number | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isDeploying] = useAtom(isDeployingAtom);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!coinName.trim()) newErrors.coinName = "Coin Name is required";
    if (!coinDescription.trim())
      newErrors.coinDescription = "Coin Description is required";
    if (!logoUrl.trim()) newErrors.logoUrl = "Logo URL is required";
    else if (!isValidUrl(logoUrl))
      newErrors.logoUrl = "Please enter a valid URL";
    if (!twitterHandle.trim())
      newErrors.twitterHandle = "Twitter Handle is required";
    if (!investment) newErrors.investment = "Investment amount is required";
    else if (isNaN(Number(investment)) || Number(investment) <= 0)
      newErrors.investment = "Please enter a valid investment amount";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      onHandleSubmit({
        coinName,
        coinDescription,
        logoUrl,
        twitterHandle,
        investment: Number(investment),
      });
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Launch Your Meme Coin</CardTitle>
        <CardDescription>
          Fill out the details to deploy your new meme coin on our launchpad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coinName">Coin Name</Label>
            <Input
              id="coinName"
              placeholder="e.g. DogeMoon"
              required
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
            />
            {errors.coinName && (
              <p className="text-sm text-red-500">{errors.coinName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="coinDescription">Coin Description</Label>
            <Textarea
              id="coinDescription"
              placeholder="Describe your meme coin"
              required
              value={coinDescription}
              onChange={(e) => setCoinDescription(e.target.value)}
            />
            {errors.coinDescription && (
              <p className="text-sm text-red-500">{errors.coinDescription}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                required
              />
            </div>
            {errors.logoUrl && (
              <p className="text-sm text-red-500">{errors.logoUrl}</p>
            )}
            {logoUrl && isValidUrl(logoUrl) && (
              <div className="mt-2">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-16 w-16 object-contain"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Handle</Label>
            <div className="relative">
              <XIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                id="twitter"
                placeholder="@yourhandle"
                className="pl-10"
                required
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
            </div>
            {errors.twitterHandle && (
              <p className="text-sm text-red-500">{errors.twitterHandle}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="investment">XRD Investment for 10% Stake</Label>
            <div className="relative">
              <Input
                id="investment"
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount of XRD"
                className="pr-12"
                required
                value={investment}
                onChange={(e) =>
                  setInvestment(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground">
                XRD
              </span>
            </div>
            {errors.investment && (
              <p className="text-sm text-red-500">{errors.investment}</p>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className={`w-full ${isDeploying ? "animate-pulse" : ""}`}
          onClick={handleSubmit}
          disabled={isDeploying}
        >
          {isDeploying ? (
            <>
              <span className="mr-2">Launching...</span>
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            </>
          ) : (
            "Launch Meme Coin"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
