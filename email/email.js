// 1. Check for new emails
async function checkForNewEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread",
  });
  const messages = response.data.messages || [];
  for (const message of messages) {
    const fullMessage = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });
    const threadId = fullMessage.data.threadId;
    const headers = fullMessage.data.payload.headers;
    const subjectHeader = headers.find((h) => h.name === "Subject");
    const subject = subjectHeader ? subjectHeader.value : "";
    const fromHeader = headers.find((h) => h.name === "From");
    const from = fromHeader ? fromHeader.value : "";
    const toHeader = headers.find((h) => h.name === "To");
    const to = toHeader ? toHeader.value : "";
    const ccHeader = headers.find((h) => h.name === "Cc");
    const cc = ccHeader ? ccHeader.value : "";
    const bccHeader = headers.find((h) => h.name === "Bcc");
    const bcc = bccHeader ? bccHeader.value : "";
    const replyHeaders = headers.filter(
      (h) =>
        h.name.toLowerCase().startsWith("in-reply-to") ||
        h.name.toLowerCase().startsWith("references")
    );
    if (replyHeaders.length === 0) {
      // 2. Send replies to emails with no prior replies
      await sendReply(auth, threadId, from, to, cc, bcc, subject);
      // 3. Add a label and move the email to the label
      await addLabelToEmail(auth, threadId, "Auto-Replied");
    }
  }
}

// 2. Send a reply to the email thread
async function sendReply(auth, threadId, from, to, cc, bcc, subject) {
  const gmail = google.gmail({ version: "v1", auth });
  const message = [
    "From: me",
    `To: ${from}`,
    `Cc: ${cc}`,
    `Bcc: ${bcc}`,
    `Subject: Re: ${subject}`,
    "",
    "Thank you for your email. I am currently out of office and will respond to your message as soon as possible.",
  ].join("\n");
  await gmail.users.threads.modify({
    userId: "me",
    id: threadId,
    resource: {
      removeLabelIds: ["UNREAD"],
    },
  });
  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      threadId: threadId,
      raw: Buffer.from(message).toString("base64"),
    },
  });
}


// Add a label to the message and move it to that label
async function addLabelToEmail(auth, messageId, labelName) {
    const gmail = google.gmail({version: 'v1', auth});
  
    // Check if the label exists, and if not, create it
    const label = await getLabel(auth, labelName);
    if (!label) {
      await createLabel(auth, labelName);
    }
  
    // Modify the message to add the label
    const modifyRequest = {
      addLabelIds: [label.id],
      removeLabelIds: ['UNREAD'],
      ids: [messageId],
    };
  
    await gmail.users.messages.modify(modifyRequest, 'me');
  }
  
  // Helper function to retrieve a label by name
  async function getLabel(auth, labelName) {
    const gmail = google.gmail({version: 'v1', auth});
  
    const res = await gmail.users.labels.list({userId: 'me'});
  
    const label = res.data.labels.find(l => l.name === labelName);
  
    return label;
  }
  
  // Helper function to create a label
  async function createLabel(auth, labelName) {
    const gmail = google.gmail({version: 'v1', auth});
  
    const createRequest = {
      name: labelName,
    };
  
    const res = await gmail.users.labels.create({
      userId: 'me',
      resource: createRequest,
    });
  
    return res.data;
  }