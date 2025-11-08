import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/AudioRecorder";
import { PhoneInput } from "@/components/PhoneInput";
import { AudioPlayer } from "@/components/AudioPlayer";
import { toast } from "@/hooks/use-toast";
import { Shield, Phone, Mic, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const Index = () => {
  const [phone, setPhone] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseAudioUrl, setResponseAudioUrl] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    toast({
      title: "Recording saved",
      description: "Your audio has been recorded successfully",
    });
  };

  const handleSubmit = async () => {
    if (!phone) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!audioBlob) {
      toast({
        title: "No recording found",
        description: "Please record your message first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("processing");

    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("audio", audioBlob, "recording.wav");

      const response = await fetch("http://localhost:8000/run_pipeline", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Pipeline execution failed");
      }

      const data = await response.json();
      
      setProcessingStatus("success");
      toast({
        title: "Success!",
        description: "Your claim request has been processed",
      });

      // Reset form
      setAudioBlob(null);
      setPhone("");
    } catch (error) {
      setProcessingStatus("error");
      toast({
        title: "Processing failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Insurance Claim Assistant</h1>
              <p className="text-sm text-muted-foreground">AI-powered voice claims processing</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Info Card */}
          <Card className="shadow-medium animate-fade-in border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
              <CardDescription>
                Our AI bot helps you file or check insurance claims through voice interaction. Simply record your
                message, and we'll process your request instantly.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Main Form Card */}
          <Card className="shadow-medium animate-fade-in border-2">
            <CardHeader>
              <CardTitle>Start Your Claim Request</CardTitle>
              <CardDescription>Enter your phone number and record your message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Phone Input */}
              <PhoneInput value={phone} onChange={setPhone} />

              {/* Audio Recorder */}
              <div className="flex flex-col items-center py-8 border-2 border-dashed border-border rounded-lg bg-secondary/30">
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                />
                {audioBlob && !isRecording && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Recording ready
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || isRecording || !audioBlob || !phone}
                className="w-full h-12 text-base font-semibold shadow-medium"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Your Request...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-5 w-5" />
                    Submit Claim Request
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {processingStatus === "success" && (
                <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-lg text-success animate-fade-in">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">Your request has been processed successfully!</p>
                </div>
              )}

              {processingStatus === "error" && (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive animate-fade-in">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Processing failed. Please try again.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Player for API Response */}
          <AudioPlayer audioUrl={responseAudioUrl} />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 pt-8">
            <Card className="text-center p-6 shadow-soft">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">Your data is encrypted and protected</p>
            </Card>
            <Card className="text-center p-6 shadow-soft">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Voice-Powered</h3>
              <p className="text-sm text-muted-foreground">Natural conversation with AI</p>
            </Card>
            <Card className="text-center p-6 shadow-soft">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Available</h3>
              <p className="text-sm text-muted-foreground">File claims anytime, anywhere</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
