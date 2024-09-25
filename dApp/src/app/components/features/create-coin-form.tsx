import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { XIcon, UploadIcon } from 'lucide-react'

interface MemeCoinLaunchpadFormProps {
  onHandleSubmit: (formData: {
    coinName: string;
    coinDescription: string;
    logoFile: File | null;
    twitterHandle: string;
    investment: number;
  }) => void;
}

export default function MemeCoinLaunchpadForm({ onHandleSubmit }: MemeCoinLaunchpadFormProps) {
  const [logoUrl, setLogoUrl] = useState('')
  const [coinName, setCoinName] = useState('CoinName')
  const [coinDescription, setCoinDescription] = useState('CoinDescription')
  const [twitterHandle, setTwitterHandle] = useState('TwitterHandle')
  const [investment, setInvestment] = useState(100);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onHandleSubmit({ coinName, coinDescription, logoFile, twitterHandle, investment })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Launch Your Meme Coin</CardTitle>
        <CardDescription>Fill out the details to deploy your new meme coin on our launchpad.</CardDescription>
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
            {logoUrl && (
              <div className="mt-2">
                <img src={logoUrl} alt="Logo preview" className="w-16 h-16 object-contain" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Handle</Label>
            <div className="relative">
              <XIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                id="twitter" 
                placeholder="@yourhandle" 
                className="pl-10" 
                required 
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
            </div>
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
                onChange={(e) => setInvestment(Number(e.target.value))}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                XRD
              </span>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" onClick={handleSubmit}>Launch Meme Coin</Button>
      </CardFooter>
    </Card>
  )
}