"""The agent harness: the loop that turns a single Claude API call into an
agent that can act.

The Claude API itself is stateless — given messages and tool definitions,
it returns either a text answer or a request to call a tool. It never
executes anything. This module is the orchestration layer around that:
it runs the send -> check for tool calls -> execute them -> feed results
back -> repeat loop until the model has a final answer, with a hard cap
so a misbehaving tool loop can't run forever.
"""

import json
import logging

from app.agent.tools import TOOLS, execute_tool

logger = logging.getLogger("agent-harness")

MAX_ITERATIONS = 5


async def run_agent(client, db, system: str, messages: list, model: str, max_tokens: int = 500) -> str:
    """Runs the tool-use loop and returns the model's final text answer.

    `messages` is the Anthropic-format conversation so far (role/content
    dicts). `db` is passed through to tool execution, not to the model.
    """
    conversation = list(messages)

    for iteration in range(MAX_ITERATIONS):
        response = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            tools=TOOLS,
            messages=conversation,
        )

        if response.stop_reason != "tool_use":
            return "".join(
                block.text for block in response.content if block.type == "text"
            )

        conversation.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            logger.info(f"tool call: {block.name}({block.input})")
            result = execute_tool(db, block.name, block.input)
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result),
                }
            )
        conversation.append({"role": "user", "content": tool_results})

    logger.warning(f"agent loop hit MAX_ITERATIONS={MAX_ITERATIONS} without a final answer")
    return "Sorry, I'm having trouble answering that right now — could you try asking again?"
