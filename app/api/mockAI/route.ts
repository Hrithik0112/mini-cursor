import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  // Create a ReadableStream for streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Mock chunks that simulate AI response
      const mockChunks = [
        "Sure! Let me help you with that.",
        "\n\nI found some relevant code in your project:",
        "\n\n- The `add` function in `utils.ts` can be refactored",
        "\n\n- There's duplicate logic in `api.ts`",
        "\n\nWould you like me to refactor these functions?",
      ];

      for (const chunk of mockChunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

